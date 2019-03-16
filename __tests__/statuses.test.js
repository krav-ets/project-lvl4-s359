import request from 'supertest';
import faker from 'faker';
import { User, TaskStatus } from '../models'; //eslint-disable-line
// import matchers from 'jest-supertest-matchers';
import app from '..';

let server;
const user = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};
const authForm = { form: { email: user.email, password: user.password } };
const taskStatus = { name: faker.random.word() };
let cookie;

describe('requests', () => {
  beforeEach(async () => {
    await User.sync({ force: true });
    await TaskStatus.sync({ force: true });
    await User.create(user);
    server = app().listen();
    const authRes = await request.agent(server)
      .post('/session')
      .type('form')
      .send(authForm);
    cookie = authRes.headers['set-cookie'];
  });

  it('GET 200', async () => {
    const res = await request.agent(server)
      .get('/statuses')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
  });

  it('POST and PATCH /statuses', async () => {
    const res = await request.agent(server)
      .post('/statuses')
      .set('Cookie', cookie)
      .send({ form: taskStatus });
    expect(res.status).toBe(302);

    const status = await TaskStatus.findOne({ where: { name: taskStatus.name } });
    expect(status.name).toBe(taskStatus.name);

    const patchRes = await request.agent(server)
      .patch(`/statuses/${status.id}/edit`)
      .set('Cookie', cookie)
      .send({ form: { name: 'newStatusName' } });
    expect(patchRes.status).toBe(302);

    const newStatus = await TaskStatus.findByPk(status.id);
    expect(newStatus.name).toBe('newStatusName');
  });

  it('DELETE /statuses', async () => {
    const res = await request.agent(server)
      .post('/statuses')
      .set('Cookie', cookie)
      .send({ form: taskStatus });
    expect(res.status).toBe(302);

    const status = await TaskStatus.findOne({ where: { name: taskStatus.name } });
    expect(status.name).toBe(taskStatus.name);

    const delRes = await request.agent(server)
      .delete(`/statuses/${status.id}/edit`)
      .set('Cookie', cookie);
    expect(delRes.status).toBe(302);

    const allStatuses = await TaskStatus.findAll();
    expect(allStatuses).toHaveLength(0);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
