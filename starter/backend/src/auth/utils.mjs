import { decode } from 'jsonwebtoken';
import { createLogger } from '../utils/logger.mjs';

const logger = createLogger('utils');

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns {string|null} a user id from the JWT token, or null if not found
 */
export function parseUserId(jwtToken) {
    if (!jwtToken) {
        logger.error('JWT token is missing');
        return null;  // or throw an error, depending on your preference
    }

    try {
        const decodedJwt = decode(jwtToken);

        // Check if the decoded JWT is valid and has a 'sub' property
        if (!decodedJwt || !decodedJwt.sub) {
            logger.error('Decoded JWT is invalid or missing user ID (sub)');
            return null;  // or throw an error, depending on your preference
        }

        return decodedJwt.sub;  // Return the user ID from the JWT token
    } catch (error) {
        logger.error(`Error decoding JWT: ${error.message}`);
        return null;  // or throw an error, depending on your preference
    }
}
