import { IconButton, InputBase, makeStyles, Paper } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import React from 'react'
import * as PropTypes from 'prop-types'

interface Props {
  onChange: (arg0: string) => void
  placeholder?: string
  children?: any
}

function SearchBox({ onChange, placeholder = 'Search', children }: Props) {
  const useStyles = makeStyles(() => ({
    paper: {
      // margin: '20px 10px',
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      maxWidth: 500,
      flexGrow: 1
    },
    input: {
      marginLeft: 8,
      flexGrow: 1
    },
    icon: {
      padding: 10
    }
  }))
  const classes = useStyles()

  function handleSearch(event: any) {
    onChange(event.target.value)
  }

  //    {/*<div className='d-flex justify-content-center row'>*/}
  return (
    <div>
      <Paper className={`${classes.paper} mx-auto my-4`}>
        <InputBase
          className={classes.input}
          placeholder={placeholder}
          onChange={handleSearch}
        />
        <IconButton className={classes.icon} aria-label="Search">
          <SearchIcon />
        </IconButton>
      </Paper>
      {children}
    </div>
  )
}

SearchBox.propTypes = {
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
}

export default SearchBox
