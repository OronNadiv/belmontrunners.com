/* global drift */
import React from "react"
import PropTypes from "prop-types"

class Drift extends React.Component {
  insertScript (scriptText) {
    const script = document.createElement("script")
    script.innerText = scriptText
    script.async = true
    document.body.appendChild(script)
  }

  addMainScript () {
    const scriptText = `!function() {
        var t = window.driftt = window.drift = window.driftt || [];
        if (!t.init) {
          if (t.invoked) return void (window.console && console.error && console.error("Drift snippet included twice."));
          t.invoked = !0, t.methods = [ "identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on" ], 
          t.factory = function(e) {
            return function() {
              var n = Array.prototype.slice.call(arguments);
              return n.unshift(e), t.push(n), t;
            };
          }, t.methods.forEach(function(e) {
            t[e] = t.factory(e);
          }), t.load = function(t) {
            var e = 3e5, n = Math.ceil(new Date() / e) * e, o = document.createElement("script");
            o.type = "text/javascript", o.async = !0, o.crossorigin = "anonymous", o.src = "https://js.driftt.com/include/" + n + "/" + t + ".js";
            var i = document.getElementsByTagName("script")[0];
            i.parentNode.insertBefore(o, i);
          };
        }
      }();
      drift.SNIPPET_VERSION = '0.3.1';
      drift.load('${this.props.appId}');
      drift.config(${JSON.stringify(this.props.config || {})});
      `

    this.insertScript(scriptText)
  }

  addIdentityVariables () {
    if (this.props.userId) {
      const scriptText = `
        drift.identify('${this.props.userId}', ${JSON.stringify(this.props.attributes)});
      `
      this.insertScript(scriptText)
    }
  }

  componentDidMount () {
    if (typeof window !== "undefined") {
      this.addMainScript()
      this.addIdentityVariables()
    }
  }

  componentWillUnmount () {
    drift && drift.reset()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.config !== this.props.config) {
      console.error('config cannot be changed once the component is mounted.')
    }
    if (drift && (
      prevProps.userId !== this.props.userId ||
      prevProps.attributes !== this.props.attributes
    )) {
      if (this.props.userId) {
        this.addIdentityVariables()
      } else if (prevProps.userId) {
        drift.reset()
      }
    }
  }

  render () {
    return ""
  }
}

const propTypes = {
  appId: PropTypes.string.isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  attributes: PropTypes.object,
  config: PropTypes.object
}

Drift.propTypes = propTypes

export default Drift