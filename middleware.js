// middleware/authMiddleware.js
module.exports.ensureAuthenticated = (req, res, next) => {
 
    if (!req.isAuthenticated()) {
   
      // console.log(req.path, req.originalUrl);
   return res.redirect('/login'); // User is not authenticated, redirect to the login page
    }
    next();
  };
  

  