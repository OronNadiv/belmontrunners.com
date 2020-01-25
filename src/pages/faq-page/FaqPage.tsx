import React, { useEffect, useState } from 'react'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { goToTop } from 'react-scrollable-anchor'
import { ExpansionPanelDetails } from '@material-ui/core';

export default function FaqPage () {
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
          minHeight: 56,
        },
      },
      content: {
        '&$expanded': {
          margin: '12px 0',
        },
      },
      expanded: {},
    })
  )
  const classesExpansionPanelSummary = useStylesExpansionPanelSummary()

  const useStylesExpansionPanelDetails = makeStyles((theme: Theme) =>
    createStyles({
      root: {
        padding: theme.spacing(2),
        backgroundColor: 'rgba(0, 0, 0, .03)',
      },
    })
  )
  const classesExpansionPanelDetails = useStylesExpansionPanelDetails()


  useEffect(goToTop, [])

  const [expanded, setExpanded] = useState<string | false>('');

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  return (
    <div className='mx-lg-5 mx-3 my-3'>
      <div className='text-center mb-3'>
        <img src="/img/faq/faq.png" alt='' className='img-fluid' />
      </div>

      <ExpansionPanel classes={classesExpansionPanel} expanded={expanded === 'panel1'}
                      onChange={handleChange('panel1')}>
        <ExpansionPanelSummary classes={classesExpansionPanelSummary} aria-controls="panel1d-content"
                               id="panel1d-header" expandIcon={<ExpandMoreIcon />}>
          <Typography>Do I have to be a fast runner?</Typography>
        </ExpansionPanelSummary>

        <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
          <Typography>
            No. Our club is meant for runners of all abilities. We want to support anyone who likes running as a way of
            keeping healthy and fit. Our group runs can accommodate fast and slow runners and always offers at least two
            distances.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel classes={classesExpansionPanel} expanded={expanded === 'panel2'}
                      onChange={handleChange('panel2')}>
        <ExpansionPanelSummary classes={classesExpansionPanelSummary} aria-controls="panel2d-content"
                               id="panel2d-header" expandIcon={<ExpandMoreIcon />}>
          <Typography>When do you run?</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
          <Typography>
            We typically run twice a week, including Saturday mornings at 8:30 am and Tuesday evenings at 6:00 pm.
            During the summer, we run at 6:00 pm on Thursdays, often at a local track.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel classes={classesExpansionPanel} expanded={expanded === 'panel3'}
                      onChange={handleChange('panel3')}>
        <ExpansionPanelSummary classes={classesExpansionPanelSummary} aria-controls="panel3d-content"
                               id="panel3d-header" expandIcon={<ExpandMoreIcon />}>
          <Typography>Where do you typically run?</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
          <Typography>
            Belmont Runners do hilly trail runs at local parks and flat road runs in Belmont, Redwood Shores, and other
            local running spots. We are always open to suggestions on great places to run and enjoy the mid-Peninsula.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel classes={classesExpansionPanel} expanded={expanded === 'panel4'}
                      onChange={handleChange('panel4')}>
        <ExpansionPanelSummary classes={classesExpansionPanelSummary} aria-controls="panel4d-content"
                               id="panel4d-header" expandIcon={<ExpandMoreIcon />}>
          <Typography>What are the group runs like?</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
          <Typography>
            On a beautiful Saturday morning you will typically find 15-20 runners. On a miserable, dark winter evening
            you might find 5-8 brave souls who will weather the rain/wind/humidity. In either case, we are a positive,
            social group that will brighten your day and help you keep connected with your local community.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel classes={classesExpansionPanel} expanded={expanded === 'panel5'}
                      onChange={handleChange('panel5')}>
        <ExpansionPanelSummary classes={classesExpansionPanelSummary} aria-controls="panel5d-content"
                               id="panel5d-header" expandIcon={<ExpandMoreIcon />}>
          <Typography>What is the membership fee?</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
          <Typography>
            Annual membership in Belmont Runners is $25. This includes the official club t-shirt. This also helps to
            cover the costs of running the club as a non-profit organization, managing the website, club membership in
            the Road Runners Club of America, providing general liability insurance that covers accidental medical
            events, and supporting the club’s programs and events.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel classes={classesExpansionPanel} expanded={expanded === 'panel6'}
                      onChange={handleChange('panel6')}>
        <ExpansionPanelSummary classes={classesExpansionPanelSummary} aria-controls="panel6d-content"
                               id="panel6d-header" expandIcon={<ExpandMoreIcon />}>
          <Typography>May I try out running with your group before becoming a member?</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
          <Typography>
            Yes! Join us for up to two runs. If you like us, we ask that you join our community of runners and
            participate in promoting health and fitness.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel classes={classesExpansionPanel} expanded={expanded === 'panel7'}
                      onChange={handleChange('panel7')}>
        <ExpansionPanelSummary classes={classesExpansionPanelSummary} aria-controls="panel7d-content"
                               id="panel7d-header" expandIcon={<ExpandMoreIcon />}>
          <Typography>What are some of the benefits of joining Belmont Runners?</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
          <Typography>
            First and foremost, you can be part of a local community of runners who enjoy social connections with other
            runners and can support your fitness goals. Membership includes an official club t-shirt, access to free or
            heavily discounted workshops and events. Recent or planned events include a foam roller workshop for
            runners, yoga for runners, nutritional classes, and visits to local breweries. Members also get great
            discounts on registering for local races and have health insurance coverage should they be injured during
            group events.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel classes={classesExpansionPanel} expanded={expanded === 'panel8'}
                      onChange={handleChange('panel8')}>
        <ExpansionPanelSummary classes={classesExpansionPanelSummary} aria-controls="panel8d-content"
                               id="panel8d-header" expandIcon={<ExpandMoreIcon />}>
          <Typography>How do I get information about the club and its events?</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
          <Typography>
            There are five ways. First, the club website (<a href='https://www.belmontrunners.com'
                                                             rel='noreferrer noopener'>belmontrunners.com</a>) provides
            information about upcoming training runs. Second, our <a href='https://www.facebook.com/belmontrunnersclub'
                                                                     target='_blank'
                                                                     rel='noreferrer noopener'>Facebook
            page</a> includes general information and breaking news. Third, we have a <a
            href='https://www.facebook.com/groups/402959680279126' target='_blank' rel='noreferrer noopener'>Facebook
            members-only group</a> that provides pictures, more detailed information, and opportunities to
            communicate with other club members. Fourth, we have an <a href='https://www.instagram.com/belmontrunners/'
                                                                       target='_blank' rel='noreferrer noopener'>Instagram
            page</a> with more content. Finally, we have a monthly newsletter that provides updates on our club.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel classes={classesExpansionPanel} expanded={expanded === 'panel9'}
                      onChange={handleChange('panel9')}>
        <ExpansionPanelSummary classes={classesExpansionPanelSummary} aria-controls="panel9d-content"
                               id="panel9d-header" expandIcon={<ExpandMoreIcon />}>
          <Typography>Do you have a Strava group?</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
          <Typography>
            Yes we do. You can find us <a href='https://www.strava.com/clubs/belmontrunners' target='_blank'
                                          rel='noreferrer noopener'>here</a>.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>

      <ExpansionPanel classes={classesExpansionPanel} expanded={expanded === 'panel10'}
                      onChange={handleChange('panel10')}>
        <ExpansionPanelSummary classes={classesExpansionPanelSummary} aria-controls="panel10d-content"
                               id="panel10d-header" expandIcon={<ExpandMoreIcon />}>
          <Typography>How can I get more information?</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails classes={classesExpansionPanelDetails}>
          <Typography>
            If you have general questions, we have a chat on the bottom right of this page. You can
            also call us <a href='tel:650-239-6300' target='_blank' rel='noreferrer noopener'>(650) 239-6300</a> or
            email us (<a href='mailto://info@belmontrunners.com' target='_blank'
                         rel='noreferrer noopener'>info@belmontrunners.com</a>) and we can answer your questions.
          </Typography>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}
