import fs from 'node:fs/promises';
import path from 'node:path';
// import fs from 'node:fs';

const filepath = path.join(process.cwd(), './data/products.ts');

fs.readFile(filepath, 'utf8').then((contents) => {
  console.log('File Contents:', contents);
});

// async function red() {
//   try {
//     const contents = await fs.readFile(filepath, 'utf8');
//     console.log('file Contents:', contents);
//   } catch (error) {
//     console.error('an eroor occured while reading the file', error.message);
//   }
// }

// red();

// fs.watchFile(filepath, (current, previous) => {
//   const formatedDate = new Intl.DateTimeFormat('en-GB', {
//     dateStyle: 'full',
//     timeStyle: 'long',
//   }).format(current.mtime);
//   return console.log(`${filepath} update, ${formatedDate}`);
// });
