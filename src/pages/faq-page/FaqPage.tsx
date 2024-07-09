import React, { useEffect, useState } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { animateScroll } from 'react-scroll'
import { ExpansionPanelDetails } from '@material-ui/core'
import data from './data.json'
import ReactMarkdown from 'react-markdown'

export default function FaqPage() {
  const useStylesExpansionPanel = makeStyles((theme: Theme) =>
      createStyles({
        root: {
          marginBottom: '1em'
          // border: '1px solid rgba(0, 0, 0, .125)',
          // boxShadow: 'none',
          // '&:not(:last-child)': {
          //   borderBottom: 0,
          // },
          // '&:before': {
          //   display: 'none',
          // },
          // '&$expanded': {
          //   margin: 'auto',
          // }
        }
      })
  )
  const classesExpansionPanel = useStylesExpansionPanel()

  const useStylesExpansionPanelSummary = makeStyles((theme: Theme) =>
      createStyles({
        root: {
          // backgroundColor: 'rgba(0, 0, 0, .03)',
          // backgroundColor: theme.palette.secondary.main,
          borderBottom: '1px solid rgba(0, 0, 0, .125)',
          marginBottom: -1,
          minHeight: 56,
          '&$expanded': {
            minHeight: 56
          }
        },
        content: {
          '&$expanded': {
            margin: '12px 0'
          }
        },
        expanded: {}
      })
  )
  const classesExpansionPanelSummary = useStylesExpansionPanelSummary()

  const useStylesExpansionPanelDetails = makeStyles((theme: Theme) =>
      createStyles({
        root: {
          padding: theme.spacing(2),
          backgroundColor: 'rgba(0, 0, 0, .03)'
        }
      })
  )
  const classesExpansionPanelDetails = useStylesExpansionPanelDetails()


  useEffect(() => {
    animateScroll.scrollToTop({ duration: 0 })
  }, [])

  const [expanded, setExpanded] = useState<string | false>('')

  const getData = () => {
    return data.map(({question, answer}, index) => {
      const panelId = `panel${index}`
      return (
          <ExpansionPanel key={panelId} classes={classesExpansionPanel}
                          expanded={expanded === panelId}
                          onChange={handleChange(panelId)}>
            <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                   aria-controls={`${panelId}d-content`}
                                   id={`${panelId}d-header`}
                                   expandIcon={<ExpandMoreIcon/>}>
              <Typography><ReactMarkdown>{question}</ReactMarkdown></Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
              <Typography><ReactMarkdown linkTarget={() => '_blank'}>{answer}</ReactMarkdown></Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
      )
    })
  }

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false)
  }

  return (
      <div className='mx-lg-5 mx-3 my-3'>
        <div className='text-center mb-3'>
          <img src="/img/faq/faq.png" alt='' className='img-fluid'/>
        </div>
        { getData() }
      </div>
  )
}
