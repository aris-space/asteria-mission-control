import { createTheme, Modal, Tooltip } from "@mantine/core";
import { themeToVars } from "@mantine/vanilla-extract";

export const theme = createTheme({
  components: {
    Tooltip: Tooltip.extend({
      defaultProps: { zIndex: 1500 },
    }),
    Modal: Modal.extend({
      defaultProps: { zIndex: 1000 },
    }),
  },
});
export const vars = themeToVars(theme);
