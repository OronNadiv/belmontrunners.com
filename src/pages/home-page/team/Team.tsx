import React from 'react'
import _ from 'underscore'

interface ITeamMember {
  name: string
  title: string
  email: string
  image: string
  instagram?: string
  twitter?: string
  linkedin?: string
  facebook?: string
  website: string
}

const team: ITeamMember[] = _.shuffle(require('./teamMembers.json'))

const getTeam = () => {
  return team.map((member, index) => {
    return (
      <div className="col-4 col-sm-4 col-md-3 col-lg-2 mx-auto" key={index}>
        <div className="team_item">
          <div className="team_img">
            {
              <img
                className="img-fluid rounded-circle"
                src={`img/team/${member.image}`}
                alt=""
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
          <h2>Board members</h2>
        </div>
        <div className="row team_inner">{getTeam()}</div>
      </div>
    </section>
  )
}

export default Team
