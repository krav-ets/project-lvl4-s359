import request from 'supertest';
import faker from 'faker';
import { User } from '../models'; //eslint-disable-line
// import matchers from 'jest-supertest-matchers';
import app from '..';

const formGenerate = () => ({
  form: {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  },
});

let server;
const userForm = formGenerate();
const authForm = { form: { email: userForm.form.email, password: userForm.form.password } };

describe('requests', () => {
  beforeAll(async () => {
    await User.sync({ force: true });
    await User.create(userForm.form);
    server = app().listen();
  });

  it('GET 200', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res.status).toBe(200);
  });

  it('GET 404', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res.status).toBe(404);
  });

  it('GET /session/new', async () => {
    const res = await request.agent(server)
      .get('/session/new');
    expect(res.status).toBe(200);
  });

  it('POST /session', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send(authForm);
    expect(res.status).toBe(302);
  });

  it('POST /session (errors)', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: { email: '', password: '' } });
    expect(res.status).toBe(200);
  });

  it('DELETE /session', async () => {
    const authRes = await request.agent(server)
      .post('/session')
      .type('form')
      .send(authForm);
    expect(authRes.status).toBe(302);

    const res = await request.agent(server)
      .delete('/session');
    expect(res.status).toBe(302);
  });

  it('GET /users/new', async () => {
    const res = await request.agent(server)
      .get('/users/new');
    expect(res.status).toBe(200);
  });

  it('POST /users', async () => {
    const form = formGenerate();
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send(form);
    // console.log(`RES: ${JSON.stringify(res, ' ', 2)}`);
    expect(res.status).toBe(302);

    const res2 = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: { email: form.form.email, password: form.form.password } });
    expect(res2.status).toBe(302);
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
