import { LogType, ParsedLog, ProgramInvocation, ComputeStats, TransactionError } from '../types';

// Regex patterns for Solana log classification
const PATTERNS = {
  // Program X invoke [N]
  INVOKE: /^Program (\w+) invoke \[(\d+)\]$/,
  // Program X success
  SUCCESS: /^Program (\w+) success$/,
  // Program X failed: <error>
  FAILURE: /^Program (\w+) failed: (.+)$/,
  // Program log: <message>
  LOG: /^Program log: (.+)$/,
  // Program X consumed N of M compute units
  COMPUTE: /^Program (\w+) consumed (\d+) of (\d+) compute units$/,
  // Program return: <program_id> <data>
  RETURN_DATA: /^Program return: (\w+) (.+)$/,
  // Program data: <base64>
  DATA: /^Program data: (.+)$/,
};

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Classify a single log line
export function classifyLog(log: string, index: number, currentDepth: number): ParsedLog {
  const baseLog: ParsedLog = {
    id: generateId(),
    type: LogType.UNKNOWN,
    message: log,
    rawMessage: log,
    depth: currentDepth,
    index,
  };

  // Check for invoke
  const invokeMatch = log.match(PATTERNS.INVOKE);
  if (invokeMatch) {
    return {
      ...baseLog,
      type: LogType.INVOKE,
      programId: invokeMatch[1],
      invokeLevel: parseInt(invokeMatch[2], 10),
      message: `Invoking ${invokeMatch[1]}`,
    };
  }

  // Check for success
  const successMatch = log.match(PATTERNS.SUCCESS);
  if (successMatch) {
    return {
      ...baseLog,
      type: LogType.SUCCESS,
      programId: successMatch[1],
      message: `${successMatch[1]} completed successfully`,
    };
  }

  // Check for failure
  const failureMatch = log.match(PATTERNS.FAILURE);
  if (failureMatch) {
    return {
      ...baseLog,
      type: LogType.FAILURE,
      programId: failureMatch[1],
      message: failureMatch[2],
    };
  }

  // Check for program log
  const logMatch = log.match(PATTERNS.LOG);
  if (logMatch) {
    return {
      ...baseLog,
      type: LogType.LOG,
      message: logMatch[1],
    };
  }

  // Check for compute units
  const computeMatch = log.match(PATTERNS.COMPUTE);
  if (computeMatch) {
    return {
      ...baseLog,
      type: LogType.COMPUTE,
      programId: computeMatch[1],
      computeUnits: {
        consumed: parseInt(computeMatch[2], 10),
        total: parseInt(computeMatch[3], 10),
      },
      message: `Consumed ${parseInt(computeMatch[2], 10).toLocaleString()} of ${parseInt(computeMatch[3], 10).toLocaleString()} compute units`,
    };
  }

  // Check for return data
  const returnMatch = log.match(PATTERNS.RETURN_DATA);
  if (returnMatch) {
    return {
      ...baseLog,
      type: LogType.RETURN_DATA,
      programId: returnMatch[1],
      returnData: returnMatch[2],
      message: `Return data from ${returnMatch[1]}`,
    };
  }

  // Check for program data
  const dataMatch = log.match(PATTERNS.DATA);
  if (dataMatch) {
    return {
      ...baseLog,
      type: LogType.DATA,
      message: dataMatch[1],
    };
  }

  return baseLog;
}

// Parse all logs and track invocation depth
export function parseLogs(rawLogs: string[]): ParsedLog[] {
  const parsedLogs: ParsedLog[] = [];
  const depthStack: string[] = []; // Stack of program IDs

  for (let i = 0; i < rawLogs.length; i++) {
    const log = rawLogs[i];
    const currentDepth = depthStack.length;
    
    // Pre-check for invoke to update depth before classifying
    const invokeMatch = log.match(PATTERNS.INVOKE);
    if (invokeMatch) {
      const parsed = classifyLog(log, i, currentDepth);
      parsedLogs.push(parsed);
      depthStack.push(invokeMatch[1]);
      continue;
    }

    // Check for success/failure to pop from stack
    const successMatch = log.match(PATTERNS.SUCCESS);
    const failureMatch = log.match(PATTERNS.FAILURE);
    
    if (successMatch || failureMatch) {
      const parsed = classifyLog(log, i, Math.max(0, currentDepth - 1));
      parsedLogs.push(parsed);
      depthStack.pop();
      continue;
    }

    // Regular log at current depth
    const parsed = classifyLog(log, i, currentDepth);
    parsedLogs.push(parsed);
  }

  return parsedLogs;
}

// Build invocation tree from parsed logs
export function buildInvocationTree(parsedLogs: ParsedLog[]): ProgramInvocation[] {
  const rootInvocations: ProgramInvocation[] = [];
  const stack: ProgramInvocation[] = [];

  for (const log of parsedLogs) {
    if (log.type === LogType.INVOKE && log.programId) {
      const invocation: ProgramInvocation = {
        programId: log.programId,
        depth: log.depth,
        invokeLevel: log.invokeLevel || 1,
        logs: [log],
        success: true, // Will be updated on success/failure
        children: [],
        startIndex: log.index,
        endIndex: log.index,
      };

      if (stack.length === 0) {
        rootInvocations.push(invocation);
      } else {
        stack[stack.length - 1].children.push(invocation);
      }
      stack.push(invocation);
    } else if (log.type === LogType.SUCCESS || log.type === LogType.FAILURE) {
      if (stack.length > 0) {
        const current = stack.pop()!;
        current.logs.push(log);
        current.endIndex = log.index;
        current.success = log.type === LogType.SUCCESS;

        // Extract compute units if this log has them
        const computeLog = current.logs.find(l => l.type === LogType.COMPUTE && l.programId === current.programId);
        if (computeLog?.computeUnits) {
          current.computeUnits = computeLog.computeUnits;
        }
      }
    } else if (stack.length > 0) {
      // Add log to current invocation
      stack[stack.length - 1].logs.push(log);
      stack[stack.length - 1].endIndex = log.index;

      // Capture compute units
      if (log.type === LogType.COMPUTE && log.computeUnits) {
        const current = stack[stack.length - 1];
        if (log.programId === current.programId) {
          current.computeUnits = log.computeUnits;
        }
      }
    }
  }

  return rootInvocations;
}

// Calculate compute stats from parsed logs
export function calculateComputeStats(parsedLogs: ParsedLog[]): ComputeStats {
  const computeLogs = parsedLogs.filter(log => log.type === LogType.COMPUTE && log.computeUnits);
  
  const perProgram: ComputeStats['perProgram'] = [];
  const seenPrograms = new Set<string>();
  
  // Get the last compute log for each program (most accurate)
  for (let i = computeLogs.length - 1; i >= 0; i--) {
    const log = computeLogs[i];
    if (log.programId && log.computeUnits && !seenPrograms.has(log.programId)) {
      seenPrograms.add(log.programId);
      perProgram.unshift({
        programId: log.programId,
        consumed: log.computeUnits.consumed,
        total: log.computeUnits.total,
      });
    }
  }

  // Total is typically from the last compute log (outermost program)
  const lastComputeLog = computeLogs[computeLogs.length - 1];
  const totalConsumed = perProgram.reduce((sum, p) => sum + p.consumed, 0);
  const totalBudget = lastComputeLog?.computeUnits?.total || 200000;

  return {
    totalConsumed,
    totalBudget,
    percentUsed: totalBudget > 0 ? (totalConsumed / totalBudget) * 100 : 0,
    perProgram,
  };
}

// Extract error info from logs and transaction error
export function extractError(
  parsedLogs: ParsedLog[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawError: any
): TransactionError | undefined {
  // Find failure log
  const failureLog = parsedLogs.find(log => log.type === LogType.FAILURE);
  
  if (!failureLog && !rawError) {
    return undefined;
  }

  let message = 'Transaction failed';
  let programId: string | undefined;
  let instructionIndex: number | undefined;
  let errorCode: string | undefined;

  if (failureLog) {
    message = failureLog.message;
    programId = failureLog.programId;
    instructionIndex = failureLog.index;
  }

  // Parse raw error for more details
  if (rawError) {
    if (typeof rawError === 'object') {
      // Handle InstructionError format: { InstructionError: [index, error] }
      if (rawError.InstructionError) {
        const [idx, err] = rawError.InstructionError;
        instructionIndex = idx;
        
        if (typeof err === 'object') {
          const errorType = Object.keys(err)[0];
          errorCode = errorType;
          if (err[errorType] && typeof err[errorType] === 'object') {
            message = `${errorType}: ${JSON.stringify(err[errorType])}`;
          } else {
            message = errorType;
          }
        } else if (typeof err === 'string') {
          message = err;
          errorCode = err;
        }
      }
    } else if (typeof rawError === 'string') {
      message = rawError;
    }
  }

  return {
    message,
    programId,
    instructionIndex,
    errorCode,
    rawError,
  };
}
