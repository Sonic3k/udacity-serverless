import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`;

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader);

  // 1. Fetch JWKS data
  const response = await Axios.get(jwksUrl);
  const jwks = response.data;

  // 2. Decode the JWT token to get the header and the `kid`
  const decodedToken = jsonwebtoken.decode(token, { complete: true });
  const kid = decodedToken.header.kid;

  // 3. Extract signing key
  const signingKeys = jwks.keys
    .filter(key => key.use === 'sig' 
                && key.kty === 'RSA' 
                && key.kid === kid // Match the kid from the token
                && key.x5c && key.x5c.length 
       ).map(key => {
         return { kid: key.kid, publicKey: certToPEM(key.x5c[0]) };
       });

  if (signingKeys.length === 0) {
    throw new Error('No matching signing key found in JWKS');
  }

  // 4. Verify token
  const publicKey = signingKeys[0].publicKey;
  return jsonwebtoken.verify(token, publicKey, {
    algorithms: ['RS256'] // Auth0 uses RS256 for JWT signing
  });
}

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
