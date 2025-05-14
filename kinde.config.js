module.exports = {
    cookies: {
        secure: false,      // Use false for HTTP (true for HTTPS)
        sameSite: 'lax',    // 'lax' is safe for HTTP, 'none' only for HTTPS
        // domain: '54.221.61.214', // Optional, can help with IPs
    }
}; 