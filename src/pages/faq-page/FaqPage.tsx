import React, { useEffect, useState } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { animateScroll } from 'react-scroll'
import { ExpansionPanelDetails } from '@material-ui/core'
import { Link } from 'react-router-dom'
import { EVENTS_HASH, ROOT } from '../../urls'

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

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false)
  }

  return (
      <div className='mx-lg-5 mx-3 my-3'>
        <div className='text-center mb-3'>
          <img src="/img/faq/faq.png" alt='' className='img-fluid'/>
        </div>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel1'}
                        onChange={handleChange('panel1')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls="panel1d-content"
                                 id="panel1d-header"
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>I don&apos;t consider myself a
              very &quot;fast&quot; runner. Will I be
              left behind?</Typography>
          </ExpansionPanelSummary>

          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              Absolutely not. Our club is open to any runner of any ability. Our
              group runs are meant to be more casual and at a conversational
              pace. We do generally split off into natural pace groups depending
              on the size of the group. Also during group runs, we have several
              stops built in to allow everyone to catch up. We support anyone
              who likes running as a way of keeping healthy and fit.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel2'}
                        onChange={handleChange('panel2')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls="panel2d-content"
                                 id="panel2d-header"
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>When do you run?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              We meet several times a week at different locations around the
              area. Click <Link
                to={`${ROOT}${EVENTS_HASH}`}>here</Link> to learn about our upcoming
              runs.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel3'}
                        onChange={handleChange('panel3')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls="panel3d-content"
                                 id="panel3d-header"
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>Where do you typically run?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              Belmont Runners do hilly trail runs at local parks and flat road
              runs in Belmont, Redwood Shores, and other
              local running spots. We are always open to suggestions on great
              places to run and enjoy the mid-Peninsula.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel4'}
                        onChange={handleChange('panel4')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls="panel4d-content"
                                 id="panel4d-header"
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>What are the group runs like?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              On a beautiful Saturday morning you will typically find 15-20
              runners. On a miserable, dark winter evening
              you might find 5-8 brave souls who will weather the
              rain/wind/humidity. In either case, we are a positive,
              social group that will brighten your day and help you keep
              connected with your local community.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel5'}
                        onChange={handleChange('panel5')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls="panel5d-content"
                                 id="panel5d-header"
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>What is the membership fee?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              Annual membership in Belmont Runners is $20. This also helps
              to cover the costs of running the club as a non-profit
              organization, managing the website, club membership in
              the Road Runners Club of America, providing general liability
              insurance that covers accidental medical
              events, and supporting the club’s programs and events.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel6'}
                        onChange={handleChange('panel6')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls='panel6d-content'
                                 id='panel6d-header'
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>May I try out running with your group before becoming a
              member?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              Yes! Join us for up to two runs. If you like us, we ask that you
              join our community of runners and
              participate in promoting health and fitness.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel7'}
                        onChange={handleChange('panel7')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls='panel7d-content'
                                 id='panel7d-header'
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>What are some of the benefits of joining Belmont
              Runners?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              First and foremost, you can be part of a local community of
              runners who enjoy social connections with other runners and can
              support your fitness goals. Access to free or heavily discounted
              workshops and events. Recent or planned events include a foam
              roller workshop for runners, yoga for runners, nutritional
              classes, and visits to local breweries. Members also get great
              discounts on registering for local races and have insurance
              coverage should they be injured during group events.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel8'}
                        onChange={handleChange('panel8')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls="panel8d-content"
                                 id="panel8d-header"
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>How do I get information about the club and its
              events?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              There are five ways. First, the club website (<a
                href='https://www.belmontrunners.com'
                rel='noreferrer noopener'>belmontrunners.com</a>) provides
              information about upcoming training runs. Second, our <a
                href='https://www.facebook.com/belmontrunnersclub'
                target='_blank'
                rel='noreferrer noopener'>Facebook
              page</a> includes general information and breaking news. Third, we
              have a <a
                href='https://www.facebook.com/groups/402959680279126'
                target='_blank' rel='noreferrer noopener'>Facebook
              members-only group</a> that provides pictures, more detailed
              information, and opportunities to
              communicate with other club members. Fourth, we have an <a
                href='https://www.instagram.com/belmontrunners/'
                target='_blank' rel='noreferrer noopener'>Instagram
              page</a> with more content. Finally, we have a monthly newsletter
              that provides updates on our club.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel82'}
                        onChange={handleChange('panel82')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls="panel82d-content"
                                 id="panel82d-header"
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>Do you cancel your runs for wildfire smoke?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              We take our runner’s health very seriously. If the local Air
              Quality Index is over 80 we will call off our group runs. The
              closest official government reading can be found at the <a
                target="_blank" rel="noopener noreferrer"
                href="https://baaqmdmapsprod.azurewebsites.net/map-air-quality-home.html">BAAQMD</a> website
              (check the Redwood City sensor). If you use a resource
              like <a target="_blank" rel="noopener noreferrer"
                      href="https://www.purpleair.com/map?opt=1/mAQI/a10/cC0#13.25/37.51397/-122.30054">Purple
              Air</a>, don’t forget to apply the US EPA filter, and to turn off
              indoor sensors.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel83'}
                        onChange={handleChange('panel83')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls="panel83d-content"
                                 id="panel83d-header"
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>Do you cancel your group runs for heat?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              Yes, if temperatures are over 90°F (32°C) we will cancel our group
              runs. For runs over 80°F (26.6°C), we will advise our runners to
              take proper precautions (bring water, slow down paces, etc).
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel84'}
                        onChange={handleChange('panel84')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls="panel84d-content"
                                 id="panel84d-header"
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>How do I get a Club Member Shirt?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              We place periodic group orders (2-3x a year) through CustomInk for
              the official performance fabric shirts. We also have a variety of
              club apparel available at our <a target="_blank"
                                               rel="noopener noreferrer"
                                               href="https://forms.gle/Gyphn2XyzEG9pkyK6">online
              store</a>.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel85'}
                        onChange={handleChange('panel85')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls="panel85d-content"
                                 id="panel85d-header"
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>Can my child join the club?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              Of course! For children between the ages of 13 and 17, create an
              account and pay the $10 youth membership fee. Children under 13
              are welcome to join us as long as they are accompanied by a
              parent/guardian. For children under 13, there is no need to
              register an online account. Talk to a run leader or board member
              at the next run to sign the liability waiver for your child.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel9'}
                        onChange={handleChange('panel9')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls="panel9d-content"
                                 id="panel9d-header"
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>Do you have a Strava group?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              Yes we do. You can find us <a
                href='https://www.strava.com/clubs/belmontrunners'
                target='_blank'
                rel='noreferrer noopener'>here</a>.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>

        <ExpansionPanel classes={classesExpansionPanel}
                        expanded={expanded === 'panel10'}
                        onChange={handleChange('panel10')}>
          <ExpansionPanelSummary classes={classesExpansionPanelSummary}
                                 aria-controls="panel10d-content"
                                 id="panel10d-header"
                                 expandIcon={<ExpandMoreIcon/>}>
            <Typography>How can I get more information?</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
            <Typography>
              If you have general questions, we have a chat on the bottom right
              of this page. You can email us at <a
                href='mailto://info@belmontrunners.com'
                target='_blank'
                rel='noreferrer noopener'>info@belmontrunners.com</a> and we can
              answer your questions.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
  )
}
