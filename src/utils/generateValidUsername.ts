function generateValidUsername(baseUsername: string) {
  const maxLength = 30; // maximum length of password

  let username = baseUsername.toLowerCase().replace(/\s+/g, '');

  //--first character is alphanumeric
  username = username.replace(/^\W+/, 'a');
  const allowedChars = 'abcdefghijklmnopqrstuvwxyz0123456789.';

  let result = username;

  while (result.length < maxLength) {
    const char = allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));

    if (char === '.' && result[result.length - 1] === '.') {
      continue;
    }

    result += char;
  }

  // Replace last '.' with alphanumeric
  if (result.endsWith('.')) {
    result = result.slice(0, -1) + allowedChars.charAt(Math.floor(Math.random() * 36));
  }

  return result.slice(0, maxLength);
}

export default generateValidUsername;
