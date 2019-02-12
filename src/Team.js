import React, { Component } from 'react'
import { shuffle } from './Random'

class Team extends Component {
  getTeam () {
    const team = shuffle([
      {
        name: 'Doug Kim',
        title: 'President',
        image: 'doug.png',
        facebook: 'dougebob',
        twitter: 'douglasckim'
      },
      {
        name: 'Theresa Saito',
        title: 'Vice President',
        image: 'theresa.png'

      },
      {
        name: 'Oron Nadiv',
        title: 'Webmaster',
        image: 'oron.jpg',
        facebook: 'oronnadiv',
        linkedin: 'oronnadiv',
        website: 'www.oronnadiv.com'

      },
      {
        name: 'Jon VanHorn',
        title: 'Communications Director',
        image: 'jon.png',
        facebook: 'jon.vanhorn',
        instagram: 'thisisjvh'
      },
      {
        name: 'Kelsey Homyk',
        title: 'Activities Director',
        image: 'kelsey.png'
      }
    ])

    return team.map((member, index) => {
      return (
        <div className="col-4 col-sm-4 col-md-3 col-lg-2 " key={index}>
          <div className="team_item">
            <div className="team_img">
              {
                <img className="img-fluid rounded-circle" src={`img/team/${member.image}`} alt="" />
              }
              <div className="hover">
                {
                  member.website &&
                  <a target="_blank" rel="noopener noreferrer" href={`https://${member.website}`}>
                    <i className="fa fa-link" />
                  </a>
                }
                {
                  member.email &&
                  <a target="_blank" rel="noopener noreferrer" href={`mailto:${member.email}`}>
                    <i className="fa fa-envelope" />
                  </a>
                }
                {
                  member.facebook &&
                  <a target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/${member.facebook}`}>
                    <i className="fa fa-facebook" />
                  </a>
                }
                {
                  member.linkedin &&
                  <a target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/in/${member.linkedin}`}>
                    <i className="fa fa-linkedin" />
                  </a>
                }
                {
                  member.twitter &&
                  <a target="_blank" rel="noopener noreferrer" href={`https://twitter.com/${member.twitter}`}>
                    <i className="fa fa-twitter" />
                  </a>
                }
                {
                  member.instagram &&
                  <a target="_blank" rel="noopener noreferrer" href={`https://www.instagram.com/${member.instagram}`}>
                    <i className="fa fa-instagram" />
                  </a>
                }
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

  render () {
    return (
      <section className="team_area p_120">
        <div className="container">
          <div className="main_title">
            <h2>Board members</h2>
          </div>
          <div className="row team_inner">
            {
              this.getTeam()
            }
          </div>
        </div>
      </section>
    )
  }
}

export default Team