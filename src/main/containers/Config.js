import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import FontAwesome from 'react-fontawesome'
import Fieldset from '../components/Fieldset'
import Header from '../components/Header'
import TextInput from '../components/TextInput'
import Checkbox from '../components/Checkbox'
import {
  createDefaultConfig,
  parseConfig,
  stringifyConfig
} from '../util/config'
import { PRELOAD_SIMULATION_TIME } from '../../common/settings'
import msToString from '../../common/util/msToString'
import { setConfig } from '../actions'

const { atob, btoa } = window

const reBase64DataUri = /^data:[^,;]+;base64,(.*)/

const fromDataUri = uri => {
  const match = reBase64DataUri.exec(uri)
  if (match != null) {
    try {
      uri = atob(match[1])
    } catch (_) {}
  }
  return uri
}

const toDataUri = value =>
  value.trim().charAt(0) === '<' ? 'data:text/xml;base64,' + btoa(value) : value

class Config extends React.Component {
  constructor (props) {
    super(props)
    const { location, config, onResetConfig } = props
    if (config != null) {
      onResetConfig()
    }
    this.state = parseConfig(location.search.substr(1)) || createDefaultConfig()
  }

  render () {
    return (
      <main className='config'>
        <Header />
        <div className='contents'>
          <form
            onSubmit={event => {
              event.preventDefault()
              this._runButton.click()
            }}
          >
            <Fieldset legend='VAST (URL or XML)'>
              <TextInput
                defaultValue={fromDataUri(this.state.vastUrl)}
                onChange={this._onChange('vastUrl')}
              />
            </Fieldset>
            <Fieldset legend='Video Player Behavior'>
              <Checkbox
                label='Unmute audio by default'
                tooltip='Allows the ad to play audio without user interaction'
                defaultValue={this.state.audioUnmuted}
                onChange={this._onChange('audioUnmuted')}
              />
              <Checkbox
                label='Simulate creative preloading'
                tooltip={
                  'Delays the start of the ad by ' +
                  msToString(PRELOAD_SIMULATION_TIME) +
                ' (useful to diagnose premature events)'
                }
                defaultValue={this.state.startDelayed}
                onChange={this._onChange('startDelayed')}
              />
            </Fieldset>
            <Fieldset legend='VPAID Creative'>
              <Checkbox
                label='Allow VPAID media files'
                tooltip='Prefers interactive media files over standard video if available'
                defaultValue={this.state.vpaidEnabled}
                onChange={this._onChange('vpaidEnabled')}
              />
              <Checkbox
                label='Populate VPAID properties before AdLoaded event'
                tooltip='Aggressively requests metadata from VPAID units (incompatible with some ads)'
                defaultValue={this.state.vpaidPropertiesAllowedBeforeAdLoaded}
                onChange={this._onChange(
                  'vpaidPropertiesAllowedBeforeAdLoaded'
                )}
              />
            </Fieldset>
            <Fieldset legend='OMID Verification'>
              <Checkbox
                label='Delay playback until verification start'
                tooltip='Requires initialization of all verification scripts before playback starts'
                defaultValue={this.state.verificationSessionRequired}
                onChange={this._onChange('verificationSessionRequired')}
              />
              <Checkbox
                label='Run verification scripts in limited-access mode'
                tooltip='Isolates verification scripts from the video player'
                defaultValue={this.state.verificationLimitedAccessMode}
                onChange={this._onChange('verificationLimitedAccessMode')}
              />
            </Fieldset>
          </form>
        </div>
        <div className='actions'>
          <nav>
            <ul>
              <li>
                <Link
                  to={{ pathname: '/run', search: stringifyConfig(this.state) }}
                  innerRef={ref => {
                    this._runButton = ref
                  }}
                >
                  Run Test <FontAwesome name='arrow-right' />
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </main>
    )
  }

  _onChange (key) {
    return value => {
      if (key === 'vastUrl') {
        value = toDataUri(value)
      }
      this.setState({
        ...this.state,
        [key]: value
      })
    }
  }
}

const mapStateToProps = ({ config }) => ({ config })

const mapDispatchToProps = dispatch => ({
  onResetConfig: () => {
    dispatch(setConfig(null))
  }
})

export default connect(mapStateToProps, mapDispatchToProps)(Config)
