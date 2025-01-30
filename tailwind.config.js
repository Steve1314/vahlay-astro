/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        batangas: ['Batangas', 'serif'],
      },
    },
  },
  plugins: [],

  theme: {
    extend: {
      animation: {
        slowspin: 'spin 20s linear infinite', // Defines a 20-second infinite rotation
      },
    },
  },
  plugins: [],
   

 
    // theme: {
    //   extend: {
    //     colors: {
    //       ivory: '#F8F6F1', // Example ivory color
    //     },
    //   },
    // },

    
    

}

