import { parseUserId } from '../auth/utils.mjs';

export function getUserId(event) {
  const authorization = event.headers?.Authorization;  // Use optional chaining

  if (!authorization) {
    console.error("Authorization header not found");
    return null;  // Return null if the header is missing
  }

  const split = authorization.split(' ');
  const jwtToken = split[1];

  return parseUserId(jwtToken);
}