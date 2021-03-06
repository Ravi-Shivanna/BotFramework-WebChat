/* eslint-disable no-magic-numbers */

import { Global } from '@emotion/core';
import { Dropdown, Label, SearchBox, Stack, TextField, Toggle } from '@fluentui/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  dirOptions,
  groupTimestampOptions,
  localeOptions,
  messageActivityWordBreakOptions,
  sendTimeoutOptions
} from './DropdownOptions';
import { bubbleBorderOptions, showBubbleNubOptions } from './webchatStyleOptions';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import { createStoreWithDevTools } from 'botframework-webchat-core';
import PlaygroundStyles from './css.js';

function App() {
  const mainRef = useRef();

  const REDUX_STORE_KEY = 'REDUX_STORE';

  // fluentui settings
  const stackTokens = { childrenGap: 10 };

  /*
  /// STATE
  */
  // Will need to be reworked once avatar images are brought in
  const [botAvatarInitials, setBotAvatarInitials] = useState(() => {
    const sessionStorageBotInitials = window.sessionStorage.getItem('PLAYGROUND_BOT_AVATAR_INITIALS');
    if (sessionStorageBotInitials === '') {
      return undefined;
    }
    return sessionStorageBotInitials;
  });

  const [bubbleNub, setBubbleNub] = useState(false);

  const [bubbleStyle, setBubbleBorders] = useState(false);

  const [dir, setDirUI] = useState(() => window.sessionStorage.getItem('PLAYGROUND_DIRECTION') || 'auto');

  const [hideSendBox, setHideSendBox] = useState(false);

  const [groupTimestamp, setGroupTimestamp] = useState(() => {
    const sessionStorageTimestamp = window.sessionStorage.getItem('PLAYGROUND_GROUP_TIMESTAMP');
    if (typeof sessionStorageTimestamp === 'string') {
      return sessionStorageTimestamp === 'true';
    }
    return sessionStorageTimestamp || true;
  });

  const [locale, setLocale] = useState(
    () => window.sessionStorage.getItem('PLAYGROUND_LANGUAGE') || window.navigator.language
  );

  const [messageActivityWordBreak, setMessageActivityWordBreak] = useState('break-word');

  const [richCardWrapTitle, setRichCardWrapTitle] = useState(false);

  const [sendTimeout, setSendTimeout] = useState(
    () => window.sessionStorage.getItem('PLAYGROUND_SEND_TIMEOUT') || 20000
  );

  const [sendTypingIndicator, setSendTypingIndicator] = useState(false);

  const [uiDisabled, setDisabledUI] = useState(false);

  // Will need to be reworked once avatar images are brought in
  const [userAvatarInitials, setUserAvatarInitials] = useState(() => {
    const sessionStorageUserInitials = window.sessionStorage.getItem('PLAYGROUND_USER_AVATAR_INITIALS');
    if (sessionStorageUserInitials === '') {
      return undefined;
    }
    return sessionStorageUserInitials;
  });

  useEffect(() => {
    document.querySelector('html').setAttribute('lang', locale);
    document.querySelector('html').setAttribute('lang', locale);
  }, [locale]);

  const store = useMemo(
    () =>
      createStoreWithDevTools({}, ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
          dispatch({
            type: 'WEB_CHAT/SEND_EVENT',
            payload: {
              name: 'webchat/join',
              value: {
                language: window.navigator.language
              }
            }
          });
        }
        return next(action);
      }),
    []
  );

  store.subscribe(() => {
    sessionStorage.setItem(REDUX_STORE_KEY, JSON.stringify(store.getState()));
  });

  const [token, setToken] = useState();

  /*
  /// CONNECTIVITY
  */

  const handleUseMockBot = useCallback(
    async url => {
      try {
        const directLineTokenRes = await fetch(`${url}/directline/token`, { method: 'POST' });

        if (directLineTokenRes.status !== 200) {
          throw new Error(`Server returned ${directLineTokenRes.status} when requesting Direct Line token`);
        }

        const { token } = await directLineTokenRes.json();

        setToken(token);
      } catch (err) {
        // eslint-disable-next-line
        console.log(err);

        // TODO: (#3515) change to TOAST
        // eslint-disable-next-line no-alert
        alert(`Failed to get Direct Line token for ${url} bot`);
      }
    },
    [setToken]
  );
  // TODO: (#3515) remember if user was connected to official mock bot or local, then fetch token from that
  const handleResetClick = useCallback(() => {
    window.sessionStorage.removeItem('REDUX_STORE');
    window.location.reload();
  }, []);

  const handleHardResetClick = useCallback(() => {
    window.sessionStorage.clear();
    window.location.reload();
  }, []);

  const handleStartConversationWithOfficialMockBot = useCallback(() => {
    handleUseMockBot('https://webchat-mockbot.azurewebsites.net');

    // TODO: (#3515) Change to TOAST
    // eslint-disable-next-line
    console.log('Playground: Started conversation with Official MockBot');
  }, [handleUseMockBot]);

  const handleStartConversationWithLocalMockBot = useCallback(() => {
    handleUseMockBot('http://localhost:3978');

    // TODO: (#3515) Change to TOAST
    // eslint-disable-next-line
    console.log('Playground: Started conversation with locally running MockBot');
  }, [handleUseMockBot]);

  /// END CONNECTIVITY

  /*
  /// Web Chat props
  */

  const handleDirChange = useCallback(
    (e, { key }) => {
      setDirUI(key);
      window.sessionStorage.setItem('PLAYGROUND_DIRECTION', key);
    },
    [setDirUI]
  );

  const handleLocaleChange = useCallback(
    (e, { key }) => {
      setLocale(key);
      document.querySelector('html').setAttribute('lang', key || window.navigator.language);
      window.sessionStorage.setItem('PLAYGROUND_LANGUAGE', key);
    },
    [setLocale]
  );

  const handleSendTypingIndicatorChange = useCallback(
    (e, checked) => {
      setSendTypingIndicator(!!checked);
    },
    [setSendTypingIndicator]
  );

  const handleUIDisabledChange = useCallback(
    (e, checked) => {
      setDisabledUI(!!checked);
    },
    [setDisabledUI]
  );

  /// END Web Chat props
  /*
  /// Style Options
  */

  const handleBotAvatarInitialsChange = useCallback(
    (e, newVal) => {
      if (newVal === '') {
        setBotAvatarInitials(undefined);
      } else {
        setBotAvatarInitials(newVal);
      }
      window.sessionStorage.setItem('PLAYGROUND_BOT_AVATAR_INITIALS', newVal);
    },
    [setBotAvatarInitials]
  );

  const handleBubbleNubChange = useCallback(
    (e, checked) => {
      setBubbleNub(!!checked);
    },
    [setBubbleNub]
  );

  const handleBubbleBorderChange = useCallback(
    (e, checked) => {
      setBubbleBorders(!!checked);
    },
    [setBubbleBorders]
  );

  const handleGroupTimestampChange = useCallback(
    (e, { key }) => {
      setGroupTimestamp(key);
      window.sessionStorage.setItem('PLAYGROUND_GROUP_TIMESTAMP', key);
    },
    [setGroupTimestamp]
  );

  const handleHideSendBoxChange = useCallback(
    (e, checked) => {
      setHideSendBox(!!checked);
    },
    [setHideSendBox]
  );

  const handleRichCardWrapTitleChange = useCallback(
    (e, checked) => {
      setRichCardWrapTitle(!!checked);
    },
    [setRichCardWrapTitle]
  );

  const handleSendTimeoutChange = useCallback(
    (e, { key }) => {
      setSendTimeout(key);
      window.sessionStorage.setItem('PLAYGROUND_SEND_TIMEOUT', key);
    },
    [setSendTimeout]
  );

  const handleUserAvatarInitialsChange = useCallback(
    (e, newVal) => {
      if (newVal === '') {
        setUserAvatarInitials(undefined);
      } else {
        setUserAvatarInitials(newVal);
      }
      window.sessionStorage.setItem('PLAYGROUND_USER_AVATAR_INITIALS', newVal);
    },
    [setUserAvatarInitials]
  );

  const handleWordBreakChange = useCallback(
    (e, { key }) => {
      setMessageActivityWordBreak(key);
    },
    [setMessageActivityWordBreak]
  );

  /// END Style Options

  useEffect(() => {
    const { current } = mainRef;
    const sendBox = current && current.querySelector('input[type="text"]');

    sendBox && sendBox.focus();
    handleStartConversationWithOfficialMockBot();
  }, [handleStartConversationWithOfficialMockBot]);

  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  const styleOptions = {
    botAvatarInitials,
    ...(bubbleNub ? showBubbleNubOptions : {}),
    ...(bubbleStyle ? bubbleBorderOptions : {}),
    groupTimestamp,
    hideSendBox,
    richCardWrapTitle,
    sendTimeout: +sendTimeout,
    userAvatarInitials
  };

  return (
    <div id="app-container" ref={mainRef}>
      <Global styles={PlaygroundStyles} />
      <ReactWebChat
        className="webchat"
        dir={dir}
        directLine={directLine}
        disabled={uiDisabled}
        locale={locale}
        sendTypingIndicator={sendTypingIndicator}
        store={store}
        styleOptions={styleOptions}
      />
      <div className="button-bar">
        {/* TODO: (#3515) enable search */}
        {/* eslint-disable-next-line no-console */}
        <Label>
          Search Web Chat props
          <SearchBox
            aria-label="Search Web Chat properties"
            placeholder="Search"
            onSearch={newValue => console.log('value is ' + newValue)}
          />
        </Label>
        <fieldset>
          <legend>Connectivity</legend>
          <button onClick={handleStartConversationWithOfficialMockBot} type="button">
            Official MockBot
          </button>
          <button onClick={handleStartConversationWithLocalMockBot} type="button">
            Local MockBot
          </button>
          <button onClick={handleResetClick} title="Reconnects to Official MockBot" type="button">
            Reset session{' '}
            <small>
              (<kbd>CTRL</kbd> + <kbd>R</kbd>)
            </small>
          </button>
          <button onClick={handleHardResetClick} title="Resets store and props to default settings" type="button">
            Hard reset session
          </button>
        </fieldset>
        <fieldset>
          <legend>Web Chat props</legend>
          <Stack tokens={stackTokens}>
            <Dropdown label="Direction" onChange={handleDirChange} options={dirOptions} selectedKey={dir} />
            <Toggle
              label="Disable UI"
              checked={uiDisabled}
              onChange={handleUIDisabledChange}
              onText="On"
              offText="Off"
            />
            <Dropdown label="Locale" onChange={handleLocaleChange} options={localeOptions} selectedKey={locale} />

            {/* TODO: (#3515) info icon: Send 'echo-typing' to the bot to turn this feature on and off */}
            <Toggle
              label="Send typing indicator"
              checked={sendTypingIndicator}
              onChange={handleSendTypingIndicatorChange}
              onText="On"
              offText="Off"
            />
          </Stack>
        </fieldset>
        <fieldset>
          <legend>Style Options</legend>
          <Stack tokens={stackTokens}>
            <Label>
              Avatar Initials
              <TextField
                label="Bot avatar initials"
                onChange={handleBotAvatarInitialsChange}
                value={botAvatarInitials || ''}
              />
              <TextField
                label="User avatar initials"
                onChange={handleUserAvatarInitialsChange}
                value={userAvatarInitials || ''}
              />
            </Label>
            <Label>
              Bubble style options
              <Toggle
                label="Show bubble nub"
                checked={bubbleNub}
                onChange={handleBubbleNubChange}
                onText="On"
                offText="Off"
              />
              <Toggle
                label="Customize bubble borders"
                checked={bubbleStyle}
                onChange={handleBubbleBorderChange}
                onText="On"
                offText="Off"
              />
            </Label>
            <Toggle
              label="Hide SendBox"
              checked={hideSendBox}
              onChange={handleHideSendBoxChange}
              onText="On"
              offText="Off"
            />
            <Dropdown
              label="Group timestamp"
              onChange={handleGroupTimestampChange}
              options={groupTimestampOptions}
              selectedKey={groupTimestamp}
            />
            {/* TODO: (#3515) info icon: Send 'herocard long title' to the bot to turn this feature on and off */}
            <Toggle
              label="Rich card wrap title"
              checked={richCardWrapTitle}
              onChange={handleRichCardWrapTitleChange}
              onText="On"
              offText="Off"
            />
            {/*  (#3515) info icon: Turn on airplane mode to test this feature */}
            <Dropdown
              label="Send timeout"
              onChange={handleSendTimeoutChange}
              options={sendTimeoutOptions}
              selectedKey={sendTimeout}
            />
            {/* TODO: (#3515) info: Send 'https://subdomain.domain.com/pathname0/pathname1/pathname2/pathname3/pathname4/' test 'break-all */}
            {/* TODO: (#3515) info: Send '箸より重いものを持ったことがない箸より重いものを持ったことがない' test 'keep-all */}
            <Dropdown
              label="Word break"
              onChange={handleWordBreakChange}
              options={messageActivityWordBreakOptions}
              selectedKey={messageActivityWordBreak}
            />
          </Stack>
        </fieldset>
      </div>
    </div>
  );
}

export default App;
