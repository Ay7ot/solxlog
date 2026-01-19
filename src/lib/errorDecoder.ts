import { DecodedError, ErrorCategory, ErrorEntry, AnchorIdl } from '../types';

// ============================================
// Solana Built-in ProgramError (0-99)
// ============================================
const SOLANA_ERRORS: ErrorEntry[] = [
    { code: 0, name: 'Custom', message: 'Custom program error', suggestion: 'Check the program logs for more details' },
    { code: 1, name: 'InvalidArgument', message: 'Invalid argument provided', suggestion: 'Verify the instruction arguments match expected format' },
    { code: 2, name: 'InvalidInstructionData', message: 'Invalid instruction data', suggestion: 'Check that instruction data is correctly serialized' },
    { code: 3, name: 'InvalidAccountData', message: 'Invalid account data', suggestion: 'Verify account data structure matches expected format' },
    { code: 4, name: 'AccountDataTooSmall', message: 'Account data too small', suggestion: 'Allocate more space for the account' },
    { code: 5, name: 'InsufficientFunds', message: 'Insufficient funds', suggestion: 'Ensure account has enough SOL/tokens for the operation' },
    { code: 6, name: 'IncorrectProgramId', message: 'Incorrect program ID', suggestion: 'Verify you are calling the correct program' },
    { code: 7, name: 'MissingRequiredSignature', message: 'Missing required signature', suggestion: 'Add the required signer to the transaction' },
    { code: 8, name: 'AccountAlreadyInitialized', message: 'Account already initialized', suggestion: 'Use a different account or check if already set up' },
    { code: 9, name: 'UninitializedAccount', message: 'Uninitialized account', suggestion: 'Initialize the account before using it' },
    { code: 10, name: 'NotEnoughAccountKeys', message: 'Not enough account keys', suggestion: 'Provide all required accounts in the transaction' },
    { code: 11, name: 'AccountBorrowFailed', message: 'Account borrow failed', suggestion: 'Account is already borrowed - check for duplicate accounts' },
    { code: 12, name: 'MaxSeedLengthExceeded', message: 'Max seed length exceeded', suggestion: 'Reduce the length of PDA seeds' },
    { code: 13, name: 'InvalidSeeds', message: 'Invalid seeds', suggestion: 'Verify PDA seeds are correct' },
    { code: 14, name: 'BorshIoError', message: 'Borsh IO error', suggestion: 'Check data serialization/deserialization' },
    { code: 15, name: 'AccountNotRentExempt', message: 'Account not rent exempt', suggestion: 'Fund account with enough SOL for rent exemption' },
    { code: 16, name: 'UnsupportedSysvar', message: 'Unsupported sysvar', suggestion: 'Use a supported sysvar' },
    { code: 17, name: 'IllegalOwner', message: 'Illegal owner', suggestion: 'Check account ownership matches expected program' },
    { code: 18, name: 'MaxAccountsDataAllocationsExceeded', message: 'Max accounts data allocations exceeded' },
    { code: 19, name: 'InvalidRealloc', message: 'Invalid realloc' },
    { code: 20, name: 'MaxInstructionTraceLengthExceeded', message: 'Max instruction trace length exceeded' },
    { code: 21, name: 'BuiltinProgramsMustConsumeComputeUnits', message: 'Builtin programs must consume compute units' },
    { code: 22, name: 'InvalidAccountOwner', message: 'Invalid account owner', suggestion: 'Verify the account is owned by the expected program' },
    { code: 23, name: 'ArithmeticOverflow', message: 'Arithmetic overflow', suggestion: 'Check for numeric overflow in calculations' },
    { code: 24, name: 'Immutable', message: 'Account is immutable', suggestion: 'Cannot modify an immutable account' },
    { code: 25, name: 'InvalidRentPayingAccount', message: 'Invalid rent-paying account' },
];

// ============================================
// Anchor Instruction Errors (100-999)
// ============================================
const ANCHOR_INSTRUCTION_ERRORS: ErrorEntry[] = [
    { code: 100, name: 'InstructionMissing', message: 'The program instruction was not found', suggestion: 'Check that the instruction exists in the program' },
    { code: 101, name: 'InstructionFallbackNotFound', message: 'Fallback functions are not supported', suggestion: 'The instruction discriminator does not match any instruction' },
    { code: 102, name: 'InstructionDidNotDeserialize', message: 'The program could not deserialize the instruction', suggestion: 'Verify instruction data format matches the IDL' },
    { code: 103, name: 'InstructionDidNotSerialize', message: 'The program could not serialize the instruction' },
    { code: 104, name: 'IdlInstructionStub', message: 'IDL instruction stub' },
    { code: 105, name: 'IdlInstructionInvalidProgram', message: 'Invalid program for IDL instruction' },
    { code: 106, name: 'ConstraintMut', message: 'A mut constraint was violated', suggestion: 'Account must be marked as mutable' },
    { code: 107, name: 'ConstraintHasOne', message: 'A has_one constraint was violated', suggestion: 'Check the account reference matches expected value' },
    { code: 108, name: 'ConstraintSigner', message: 'A signer constraint was violated', suggestion: 'Account must be a signer' },
    { code: 109, name: 'ConstraintRaw', message: 'A raw constraint was violated' },
    { code: 110, name: 'ConstraintOwner', message: 'An owner constraint was violated', suggestion: 'Account owner does not match expected program' },
    { code: 111, name: 'ConstraintRentExempt', message: 'A rent exempt constraint was violated', suggestion: 'Account must be rent exempt' },
    { code: 112, name: 'ConstraintSeeds', message: 'A seeds constraint was violated', suggestion: 'PDA seeds do not derive to expected address' },
    { code: 113, name: 'ConstraintExecutable', message: 'An executable constraint was violated', suggestion: 'Account must be executable (a program)' },
    { code: 114, name: 'ConstraintState', message: 'A state constraint was violated' },
    { code: 115, name: 'ConstraintAssociated', message: 'An associated constraint was violated' },
    { code: 116, name: 'ConstraintAssociatedInit', message: 'An associated init constraint was violated' },
    { code: 117, name: 'ConstraintClose', message: 'A close constraint was violated' },
    { code: 118, name: 'ConstraintAddress', message: 'An address constraint was violated', suggestion: 'Account address does not match expected value' },
    { code: 119, name: 'ConstraintZero', message: 'Expected zero account discriminant' },
    { code: 120, name: 'ConstraintTokenMint', message: 'A token mint constraint was violated', suggestion: 'Token account mint does not match expected mint' },
    { code: 121, name: 'ConstraintTokenOwner', message: 'A token owner constraint was violated', suggestion: 'Token account owner does not match expected owner' },
    { code: 122, name: 'ConstraintMintMintAuthority', message: 'A mint mint authority constraint was violated' },
    { code: 123, name: 'ConstraintMintFreezeAuthority', message: 'A mint freeze authority constraint was violated' },
    { code: 124, name: 'ConstraintMintDecimals', message: 'A mint decimals constraint was violated' },
    { code: 125, name: 'ConstraintSpace', message: 'A space constraint was violated', suggestion: 'Account space does not match expected size' },
    { code: 126, name: 'ConstraintAccountIsNone', message: 'An account constraint was violated - account is None' },
];

// ============================================
// Anchor Constraint Errors (2000-2999)
// ============================================
const ANCHOR_CONSTRAINT_ERRORS: ErrorEntry[] = [
    { code: 2000, name: 'ConstraintMut', message: 'A mut constraint was violated', suggestion: 'Account must be mutable' },
    { code: 2001, name: 'ConstraintHasOne', message: 'A has_one constraint was violated', suggestion: 'Account field does not match expected account' },
    { code: 2002, name: 'ConstraintSigner', message: 'A signer constraint was violated', suggestion: 'Account must sign the transaction' },
    { code: 2003, name: 'ConstraintRaw', message: 'A raw constraint was violated' },
    { code: 2004, name: 'ConstraintOwner', message: 'An owner constraint was violated', suggestion: 'Account owner does not match' },
    { code: 2005, name: 'ConstraintRentExempt', message: 'A rent exempt constraint was violated', suggestion: 'Account must have enough lamports for rent exemption' },
    { code: 2006, name: 'ConstraintSeeds', message: 'A seeds constraint was violated', suggestion: 'PDA derivation failed - check seeds and bump' },
    { code: 2007, name: 'ConstraintExecutable', message: 'An executable constraint was violated' },
    { code: 2008, name: 'ConstraintState', message: 'Deprecated - state constraint' },
    { code: 2009, name: 'ConstraintAssociated', message: 'An associated constraint was violated' },
    { code: 2010, name: 'ConstraintAssociatedInit', message: 'An associated init constraint was violated' },
    { code: 2011, name: 'ConstraintClose', message: 'A close constraint was violated' },
    { code: 2012, name: 'ConstraintAddress', message: 'An address constraint was violated', suggestion: 'Account address does not match expected' },
    { code: 2013, name: 'ConstraintZero', message: 'Expected zero discriminator' },
    { code: 2014, name: 'ConstraintTokenMint', message: 'Token mint constraint violated', suggestion: 'Token account has wrong mint' },
    { code: 2015, name: 'ConstraintTokenOwner', message: 'Token owner constraint violated', suggestion: 'Token account has wrong owner' },
    { code: 2016, name: 'ConstraintMintMintAuthority', message: 'Mint authority constraint violated' },
    { code: 2017, name: 'ConstraintMintFreezeAuthority', message: 'Freeze authority constraint violated' },
    { code: 2018, name: 'ConstraintMintDecimals', message: 'Mint decimals constraint violated' },
    { code: 2019, name: 'ConstraintSpace', message: 'Space constraint violated', suggestion: 'Account has incorrect size' },
    { code: 2020, name: 'ConstraintAccountIsNone', message: 'Required account is None' },
    { code: 2021, name: 'ConstraintTokenTokenProgram', message: 'Token program constraint violated' },
    { code: 2022, name: 'ConstraintMintTokenProgram', message: 'Mint token program constraint violated' },
    { code: 2023, name: 'ConstraintAssociatedTokenTokenProgram', message: 'ATA token program constraint violated' },
    { code: 2024, name: 'ConstraintMintGroupPointerExtension', message: 'Mint group pointer extension violated' },
    { code: 2025, name: 'ConstraintMintGroupMemberPointerExtension', message: 'Mint group member pointer extension violated' },
    { code: 2026, name: 'ConstraintMintMetadataPointerExtension', message: 'Mint metadata pointer extension violated' },
    { code: 2027, name: 'ConstraintMintCloseAuthorityExtension', message: 'Mint close authority extension violated' },
    { code: 2028, name: 'ConstraintMintPermanentDelegateExtension', message: 'Mint permanent delegate extension violated' },
    { code: 2029, name: 'ConstraintMintTransferHookExtension', message: 'Mint transfer hook extension violated' },
];

// ============================================
// Anchor Account Errors (3000-4099)
// ============================================
const ANCHOR_ACCOUNT_ERRORS: ErrorEntry[] = [
    { code: 3000, name: 'AccountDiscriminatorAlreadySet', message: 'Account discriminator already set' },
    { code: 3001, name: 'AccountDiscriminatorNotFound', message: 'Account discriminator not found', suggestion: 'Account may not be initialized or wrong type' },
    { code: 3002, name: 'AccountDiscriminatorMismatch', message: 'Account discriminator mismatch', suggestion: 'Account is of wrong type' },
    { code: 3003, name: 'AccountDidNotDeserialize', message: 'Account did not deserialize', suggestion: 'Account data corrupted or wrong format' },
    { code: 3004, name: 'AccountDidNotSerialize', message: 'Account did not serialize' },
    { code: 3005, name: 'AccountNotEnoughKeys', message: 'Not enough account keys provided' },
    { code: 3006, name: 'AccountNotMutable', message: 'Account is not mutable', suggestion: 'Pass account as mutable in transaction' },
    { code: 3007, name: 'AccountOwnedByWrongProgram', message: 'Account owned by wrong program', suggestion: 'Account owner does not match expected program' },
    { code: 3008, name: 'InvalidProgramId', message: 'Invalid program ID' },
    { code: 3009, name: 'InvalidProgramExecutable', message: 'Program is not executable' },
    { code: 3010, name: 'AccountNotSigner', message: 'Account is not a signer', suggestion: 'Account must sign the transaction' },
    { code: 3011, name: 'AccountNotSystemOwned', message: 'Account is not system owned' },
    { code: 3012, name: 'AccountNotInitialized', message: 'Account is not initialized', suggestion: 'Initialize the account before using' },
    { code: 3013, name: 'AccountNotProgramData', message: 'Account is not program data' },
    { code: 3014, name: 'AccountNotAssociatedTokenAccount', message: 'Account is not an associated token account' },
    { code: 3015, name: 'AccountSysvarMismatch', message: 'Account sysvar mismatch', suggestion: 'Wrong sysvar account provided' },
    { code: 3016, name: 'AccountReallocExceedsLimit', message: 'Account realloc exceeds limit' },
    { code: 3017, name: 'AccountDuplicateReallocs', message: 'Account has duplicate reallocs' },
];

// ============================================
// Anchor Misc Errors (4100-4999)
// ============================================
const ANCHOR_MISC_ERRORS: ErrorEntry[] = [
    { code: 4100, name: 'DeclaredProgramIdMismatch', message: 'Declared program ID mismatch', suggestion: 'Program ID in code does not match deployed' },
    { code: 4101, name: 'TryingToInitPayerAsProgramAccount', message: 'Trying to init payer as program account' },
    { code: 4102, name: 'InvalidNumericConversion', message: 'Invalid numeric conversion' },
];

// ============================================
// Helper Functions
// ============================================

/**
 * Parse error code from various input formats
 */
export function parseErrorInput(input: string): number | null {
    const trimmed = input.trim();

    // Try to extract hex code from full error message
    // e.g., "custom program error: 0x1771"
    const hexMatch = trimmed.match(/0x([0-9a-fA-F]+)/);
    if (hexMatch) {
        return parseInt(hexMatch[1], 16);
    }

    // Try to extract decimal from error message
    // e.g., "Error Code: 6001"
    const decMatch = trimmed.match(/(?:error\s*(?:code)?:?\s*)(\d+)/i);
    if (decMatch) {
        return parseInt(decMatch[1], 10);
    }

    // Try as plain hex without 0x prefix
    if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length <= 8) {
        // Could be hex or decimal, prefer hex if it contains a-f
        if (/[a-fA-F]/.test(trimmed)) {
            return parseInt(trimmed, 16);
        }
    }

    // Try as plain decimal
    if (/^\d+$/.test(trimmed)) {
        return parseInt(trimmed, 10);
    }

    return null;
}

/**
 * Get error category based on code
 */
function getErrorCategory(code: number): { category: ErrorCategory; label: string; range: string } {
    if (code >= 0 && code < 100) {
        return { category: 'solana_builtin', label: 'Solana Built-in Error', range: '0-99' };
    }
    if (code >= 100 && code < 1000) {
        return { category: 'anchor_instruction', label: 'Anchor Instruction Error', range: '100-999' };
    }
    if (code >= 1000 && code < 2000) {
        return { category: 'anchor_idl', label: 'Anchor IDL Error', range: '1000-1999' };
    }
    if (code >= 2000 && code < 3000) {
        return { category: 'anchor_constraint', label: 'Anchor Constraint Error', range: '2000-2999' };
    }
    if (code >= 3000 && code < 4100) {
        return { category: 'anchor_account', label: 'Anchor Account Error', range: '3000-4099' };
    }
    if (code >= 4100 && code < 5000) {
        return { category: 'anchor_misc', label: 'Anchor Misc Error', range: '4100-4999' };
    }
    if (code === 5000) {
        return { category: 'anchor_deprecated', label: 'Deprecated Error', range: '5000' };
    }
    return { category: 'custom_program', label: 'Custom Program Error', range: '6000+' };
}

/**
 * Look up error in built-in databases
 */
function lookupBuiltinError(code: number): ErrorEntry | null {
    // Check all databases
    const allErrors = [
        ...SOLANA_ERRORS,
        ...ANCHOR_INSTRUCTION_ERRORS,
        ...ANCHOR_CONSTRAINT_ERRORS,
        ...ANCHOR_ACCOUNT_ERRORS,
        ...ANCHOR_MISC_ERRORS,
    ];

    return allErrors.find(e => e.code === code) || null;
}

/**
 * Look up error in IDL
 */
function lookupIdlError(code: number, idl: AnchorIdl): ErrorEntry | null {
    if (!idl.errors) return null;

    const error = idl.errors.find(e => e.code === code);
    if (error) {
        return {
            code: error.code,
            name: error.name,
            message: error.msg || `Custom error from ${idl.name || 'program'}`,
        };
    }
    return null;
}

/**
 * Decode an error code
 */
export function decodeError(code: number, idl?: AnchorIdl): DecodedError {
    const hex = '0x' + code.toString(16);
    const { category, label, range } = getErrorCategory(code);

    // Try built-in lookup first
    const builtinError = lookupBuiltinError(code);
    if (builtinError) {
        return {
            code,
            hex,
            category,
            categoryLabel: label,
            range,
            name: builtinError.name,
            message: builtinError.message,
            suggestion: builtinError.suggestion,
        };
    }

    // Try IDL lookup for custom errors
    if (idl && code >= 6000) {
        const idlError = lookupIdlError(code, idl);
        if (idlError) {
            return {
                code,
                hex,
                category,
                categoryLabel: label,
                range,
                name: idlError.name,
                message: idlError.message,
                suggestion: idlError.suggestion,
            };
        }
    }

    // Return generic result
    return {
        code,
        hex,
        category,
        categoryLabel: label,
        range,
        name: undefined,
        message: category === 'custom_program'
            ? 'This is a custom error from the program. Upload the program IDL to decode it.'
            : 'Unknown error code',
        suggestion: category === 'custom_program'
            ? 'Find the program\'s IDL (usually in target/idl/) and upload it to decode this error.'
            : undefined,
    };
}

/**
 * Parse an IDL JSON string
 */
export function parseIdl(jsonString: string): AnchorIdl | null {
    try {
        const parsed = JSON.parse(jsonString);
        // Basic validation
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed as AnchorIdl;
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Get common errors for quick reference
 */
export function getCommonErrors(): Array<{ code: number; hex: string; name: string; category: string }> {
    return [
        { code: 101, hex: '0x65', name: 'InstructionFallbackNotFound', category: 'Anchor' },
        { code: 2006, hex: '0x7d6', name: 'ConstraintSeeds', category: 'Anchor' },
        { code: 3007, hex: '0xbbf', name: 'AccountOwnedByWrongProgram', category: 'Anchor' },
        { code: 3012, hex: '0xbc4', name: 'AccountNotInitialized', category: 'Anchor' },
        { code: 3010, hex: '0xbc2', name: 'AccountNotSigner', category: 'Anchor' },
        { code: 2001, hex: '0x7d1', name: 'ConstraintHasOne', category: 'Anchor' },
        { code: 2002, hex: '0x7d2', name: 'ConstraintSigner', category: 'Anchor' },
        { code: 5, hex: '0x5', name: 'InsufficientFunds', category: 'Solana' },
        { code: 7, hex: '0x7', name: 'MissingRequiredSignature', category: 'Solana' },
        { code: 15, hex: '0xf', name: 'AccountNotRentExempt', category: 'Solana' },
    ];
}

/**
 * Format hex code for display
 */
export function formatHex(code: number): string {
    return '0x' + code.toString(16);
}
