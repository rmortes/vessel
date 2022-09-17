const wordSeparators = /[\s\-_]+/;

export function toPascalCase(str: string): string {
  const words = str.split(wordSeparators);
  const len = words.length;
  const mappedWords = new Array(len);

  for (let i = 0; i < len; i++) {
    const word = words[i];
    if (word === '') continue;
    mappedWords[i] = word[0].toUpperCase() + word.slice(1);
  }

  return mappedWords.join('');
}

export function uppercaseFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function lowercaseFirstLetter(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
