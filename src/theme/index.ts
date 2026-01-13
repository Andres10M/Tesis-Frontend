import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      500: "#003B73", // Azul cooperativa
      600: "#002855",
      gold: "#DAA520", // Dorado cooperativa
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.50",
      },
    },
  },
});

export default theme;
