FROM node:18-alpine

WORKDIR /backend

# Copy package.json dan package-lock.json
# Ini dilakukan terpisah untuk memanfaatkan Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy seluruh source code aplikasi
COPY . .

# Buat user non-root untuk keamanan
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Ubah ownership file ke user nodejs
RUN chown -R nextjs:nodejs /backend
USER nextjs

# Expose port yang digunakan aplikasi
EXPOSE 5000

# Command untuk menjalankan aplikasi
CMD ["node", "index.js"]