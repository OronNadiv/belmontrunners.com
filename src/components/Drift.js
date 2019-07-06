/* global drift */
import React, { useCallback, useEffect } from "react"
import * as PropTypes from "prop-types"
import { Map as IMap } from 'immutable'

const Drift = ({ appId, config, userId, attributes }) => {
  userId = userId || ''
  config = new IMap(config)
  attributes = new IMap(attributes)
  const insertScript = (scriptText) => {
    const element = document.createElement("script")
    element.innerText = scriptText
    element.async = true
    document.body.appendChild(element)
    return element
  }

  const removeElement = (element) => {
    document.body.removeChild(element)
  }

  const addMainScript = useCallback(() => {
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
      drift.load('${appId}');
      drift.config(${JSON.stringify(config ? config.toJS() : {})});
      `

    return insertScript(scriptText)
  }, [appId, config])

  const addIdentityVariables = useCallback(() => {
    const scriptText = `
        drift.identify('${userId}', ${JSON.stringify(attributes.toJS())});
      `
    return insertScript(scriptText)
  }, [userId, attributes])

  useEffect(() => {
    let elem
    if (typeof window !== "undefined") {
      elem = addMainScript()
    }
    return () => {
      elem && removeElement(elem)
    }
  }, [userId, appId, config, addMainScript])

  useEffect(() => {
    let elem
    if (typeof window !== "undefined" && drift) {
      elem = addIdentityVariables()
    }
    return () => {
      elem && removeElement(elem)
      drift && drift.reset()
    }
  }, [userId, attributes, addIdentityVariables])

  return <></>
}

const propTypes = {
  appId: PropTypes.string.isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  attributes: PropTypes.object,
  config: PropTypes.object
}

Drift.propTypes = propTypes

export default Drift