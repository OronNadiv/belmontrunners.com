import React from 'react'
import _ from 'underscore'

interface ITeamMember {
  name: string
  title: string
  email: string
  image: string
  instagram?: string
  strava?: string
  twitter?: string
  linkedin?: string
  facebook?: string
  website: string
}

const leadership: ITeamMember[] = _.shuffle(require('./teamMembers.json'))

const getTeam = () => {
  return leadership.map((member, index) => {
    return (
      <div className="col-3 mx-auto" key={index}>
        <div className="team_item  mx-lg-5">
          <div className="team_img">
            {
              <img
                className="img-fluid rounded-circle"
                src={`img/team/${member.image}`}
                alt={member.name}
              />
            }
            <div className="hover">
              {member.website && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://${member.website}`}
                >
                  <i className="fas fa-link" />
                </a>
              )}
              {member.email && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`mailto:${member.email}`}
                >
                  <i className="fas fa-envelope" />
                </a>
              )}
              {member.facebook && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.facebook.com/${member.facebook}`}
                >
                  <i className="fab fa-facebook-f" />
                </a>
              )}
              {member.linkedin && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.linkedin.com/in/${member.linkedin}`}
                >
                  <i className="fab fa-linkedin-in" />
                </a>
              )}
              {member.twitter && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://twitter.com/${member.twitter}`}
                >
                  <i className="fab fa-twitter" />
                </a>
              )}
              {member.instagram && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.instagram.com/${member.instagram}`}
                >
                  <i className="fab fa-instagram" />
                </a>
              )}
              {member.strava && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://www.strava.com/athletes/${member.strava}`}
                >
                  <i className="fab fa-strava" />
                </a>
              )}
              {member.medium && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://${member.medium}.medium.com`}
                >
                  <i className="fab fa-medium" />
                </a>
              )}
            </div>
          </div>
          <div className="team_name">
            <h4>{member.name}</h4>
            <p>{member.title}</p>
          </div>
        </div>
      </div>
    )
  })
}

function Team() {
  return (
    <section className="team_area p_120">
      <div className="container">
        <div className="main_title">
          <h2>Leadership</h2>
        </div>
        <div className="row team_inner">{getTeam()}</div>
      </div>
    </section>
  )
}

export default Team
