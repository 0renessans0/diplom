// Простая валидация
module.exports = {
    validatePhone: (phone) => {
        return phone && phone.length >= 10;
    },
    validateEmail: (email) => {
        if (!email) return true;
        return email.includes('@');
    }
};
