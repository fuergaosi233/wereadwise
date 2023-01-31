import * as React from 'react';
import {browser, Tabs} from 'webextension-polyfill-ts';
import './styles.scss';
import {getReadwiseAccessToken, getWeReadCookies, SyncAllData} from '../lib';

function loginWeReed(): Promise<Tabs.Tab> {
  return browser.tabs.create({url: 'https://weread.qq.com/#login'});
}
function loginReadWise(): Promise<Tabs.Tab> {
  return browser.tabs.create({url: 'https://readwise.io/access_token'});
}
const ItemRow: React.FC<{
  title: string;
  status: boolean;
  onRecheck: () => void;
  login: () => Promise<Tabs.Tab>;
}> = ({title, status, onRecheck, login}) => {
  return (
    <div className="flex items-center mb-5">
      {status ? (
        <p className="text-gray-600 text-green-600">Ready!</p>
      ) : (
        <>
          <p className="text-gray-600 mr-5">{title}:</p>
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={login}
          >
            Login
          </button>
          <button
            type="button"
            // Always on the far right
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  ml-auto"
            onClick={onRecheck}
          >
            Recheck
          </button>
        </>
      )}

      {/* Add some animation for loading */}
    </div>
  );
};
const SyncButton: React.FC<{
  readwiseAccessToken: string;
  weReadUsername: string;
}> = ({readwiseAccessToken, weReadUsername}) => {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [stage, setStage] = React.useState('');
  const [bookCount, setBookCount] = React.useState(0);
  const [status, setStatus] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const startSync = async (): Promise<void> => {
    setIsSyncing(true);
    try {
      await SyncAllData({
        accessToken: readwiseAccessToken,
        setStage,
        setBookCount,
        setStatus,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsSyncing(false);
    }
  };
  switch (true) {
    case status:
      return (
        <div className="flex flex-col items-center">
          {/* Display beautiful green success message */}
          <span className="text-green-600">Success! </span>
          {/* Disply import book count */}
          <span className="text-green-600">Import {bookCount} books!</span>
        </div>
      );
    case isSyncing:
      return (
        // dont close this page
        <div className="flex flex-col items-center">
          <p className="text-gray-600 mb-5">
            <strong
              className="
            animate-pulse
            inline-block
            bg-gray-200
            rounded-full
            px-3
            py-1
            text-sm
            font-semibold
            text-red-700
            mr-2
            mb-2
          "
            >
              Please don&#39;t close this page
            </strong>
          </p>
          <strong>Syncing...</strong>
          <p className="text-gray-600 mb-5">
            <strong className="mr-auto">Stage:</strong>
            <span className="ml-auto"> {stage} </span>
          </p>
          <p className="text-gray-600 mb-5">
            <strong className="mr-auto">Book Count:</strong>{' '}
            <span className="ml-auto"> {bookCount}</span>
          </p>
          {errorMessage && (
            <p className="text-gray-600 mb-5">
              <strong className="mr-auto">Error:</strong>
              <span className="ml-auto"> {errorMessage}</span>
            </p>
          )}
        </div>
      );
    case !readwiseAccessToken || !weReadUsername:
      return <></>;
    default:
      return (
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
          disabled={!readwiseAccessToken || !weReadUsername}
          onClick={startSync}
        >
          🚀 Start Sync
        </button>
      );
  }
};

const Popup: React.FC = () => {
  const [ReadWiseToken, setReadWiseToken] = React.useState('');
  const [wxReedCookies, setWxReedCookies] =
    React.useState<chrome.cookies.Cookie[] | null>(null);
  const [weReedUsername, setWeReedUsername] = React.useState('');
  const updateReadWiseToken = async (): Promise<void> => {
    const token = await getReadwiseAccessToken();
    setReadWiseToken(token);
  };
  const updateWeReadUserName = (cookies: chrome.cookies.Cookie[]): void => {
    cookies.find((cookie) => {
      if (cookie.name === 'wr_name') {
        setWeReedUsername(cookie.value);
        return true;
      }
      return false;
    });
  };
  const updateWeReedAuthInfo = async (): Promise<void> => {
    const cookies = await getWeReadCookies();
    setWxReedCookies(cookies);
  };
  // Init data
  React.useEffect(() => {
    updateReadWiseToken();
    updateWeReedAuthInfo();
  }, []);
  React.useEffect(() => {
    if (wxReedCookies) {
      updateWeReadUserName(wxReedCookies);
    }
  }, [wxReedCookies]);
  // Automatic redetection every 1s

  return (
    <section id="popup">
      <div className="container mx-auto bg-gray-200 rounded-xl shadow border p-8">
        <h2 className="text-3xl text-gray-700 font-bold mb-5">
          WeRead 2 Readwise
        </h2>
        <p className="text-gray-600 mb-5">
          This extension will help you to sync your reading highlight from
          WeRead to Readwise.
        </p>
        <p className="text-gray-600 mb-5">
          <strong>Step 1:</strong> Login to WeRead; Login Readwise and generate
          a AccecssToken.
        </p>
        <p className="text-gray-600 mb-5">
          <strong>Step 2:</strong> Click the button below to start syncing.
        </p>
        {/* Display WeRead Status and add recheck button */}
        <ItemRow
          title="WeRead"
          status={!!weReedUsername}
          onRecheck={updateWeReedAuthInfo}
          login={loginWeReed}
        />

        {/* Add Readwise Status */}
        <ItemRow
          title="Readwise"
          status={!!ReadWiseToken}
          onRecheck={updateReadWiseToken}
          login={loginReadWise}
        />
        <div className="flex">
          <SyncButton
            readwiseAccessToken={ReadWiseToken}
            weReadUsername={weReedUsername}
          />
        </div>
      </div>
    </section>
  );
};

export default Popup;
