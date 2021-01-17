// mocking HTTP requests
// http://localhost:3000/login-submission

import * as React from 'react';
// 🐨 you'll need to grab waitForElementToBeRemoved from '@testing-library/react'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {build, fake} from '@jackfranklin/test-data-bot';
import {setupServer} from 'msw/node';
import Login from '../../components/login-submission';
import {handlers} from 'test/server-handlers';
import {rest} from 'msw';

const buildLoginForm = build({
  fields: {
    username: fake(f => f.internet.userName()),
    password: fake(f => f.internet.password()),
  },
});

// 🐨 get the server setup with an async function to handle the login POST request:
// 💰 here's something to get you started
// rest.post(
//   'https://auth-provider.example.com/api/login',
//   async (req, res, ctx) => {},
// )
// you'll want to respond with an JSON object that has the username.
// 📜 https://mswjs.io/
const server = setupServer(...handlers);

// 🐨 before all the tests, start the server with `server.listen()`
// 🐨 after all the tests, stop the server with `server.close()`
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test(`logging in displays the user's username`, async function () {
  render(<Login />);
  const {username, password} = buildLoginForm();

  userEvent.type(screen.getByLabelText(/username/i), username);
  userEvent.type(screen.getByLabelText(/password/i), password);
  // 🐨 uncomment this and you'll start making the request!
  userEvent.click(screen.getByRole('button', {name: /submit/i}));
  // screen.debug();

  // as soon as the user hits submit, we render a spinner to the screen. That
  // spinner has an aria-label of "loading" for accessibility purposes, so
  // 🐨 wait for the loading spinner to be removed using waitForElementToBeRemoved
  // 📜 https://testing-library.com/docs/dom-testing-library/api-async#waitforelementtoberemoved
  const loadingEl = screen.getByLabelText(/loading/i);
  //  document.querySelector('[aria-label="loading..."]');
  await waitForElementToBeRemoved(loadingEl);
  expect(screen.getByText(/welcome/i)).toBeInTheDocument();

  // once the login is successful, then the loading spinner disappears and
  // we render the username.
  // 🐨 assert that the username is on the screen
});

test(`Test username required`, async () => {
  render(<Login />);
  const {password} = buildLoginForm();

  userEvent.type(screen.getByLabelText(/password/i), password);
  // 🐨 uncomment this and you'll start making the request!
  userEvent.click(screen.getByRole('button', {name: /submit/i}));
  const loadingEl = screen.getByLabelText(/loading/i);
  await waitForElementToBeRemoved(loadingEl);
  expect(screen.getByText(/username required/i)).toBeInTheDocument();
});

test(`Test password required`, async () => {
  render(<Login />);
  const {username} = buildLoginForm();

  userEvent.type(screen.getByLabelText(/username/i), username);
  // 🐨 uncomment this and you'll start making the request!
  userEvent.click(screen.getByRole('button', {name: /submit/i}));
  const loadingEl = screen.getByLabelText(/loading/i);
  await waitForElementToBeRemoved(loadingEl);
  // expect(screen.getByText(/password required/i)).toBeInTheDocument();
  expect(screen.getByRole('alert').textContent).toMatchInlineSnapshot(
    `"password required"`,
  );
});

test(`Unknown server errors displays the error message`, async () => {
  const testErrorMessage = 'Oops... something went wrong!';
  server.use(
    rest.post(
      // note that it's the same URL as our app-wide handler
      // so this will override the other.
      'https://auth-provider.example.com/api/login',
      async (req, res, ctx) => {
        // your one-off handler here
        return res(ctx.status(500), ctx.json({message: testErrorMessage}));
      },
    ),
  );
  render(<Login />);
  userEvent.click(screen.getByRole('button', {name: /submit/i}));
  const loadingEl = screen.getByLabelText(/loading/i);
  await waitForElementToBeRemoved(loadingEl);
  expect(screen.getByRole('alert')).toHaveTextContent(testErrorMessage);
});
