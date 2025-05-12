import pkg from 'pg';
const { Pool } = pkg;

import dbConfig from './config/database.js';

const pool = new Pool(dbConfig);

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Koneksi gagal:', err);
  } else {
    console.log('Koneksi berhasil:', res.rows);
  }
  pool.end();
});
