# MongoDB-ni o'rnatish uchun Dockerfile

# O'rnatish uchun bazaviy imojni tanlash
FROM mongo

# MongoDB porti
EXPOSE 27017

# Konteynerni ishga tushirishda MongoDB-ni boshlash
CMD ["mongod"]
