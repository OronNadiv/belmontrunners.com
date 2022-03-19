import { createTheme } from '@material-ui/core/styles'
import purple from '@material-ui/core/colors/purple'

export default createTheme({
  palette: {
    primary: { main: purple[700] }, // Purple and green play nicely together.
    secondary: { main: purple[200] } // This is just green.A700 as hex.
  }
})
