const app = require('../app');
const request = require('supertest');
const expect = require('chai').expect;
const { describe, it} = require('mocha');

const { faker } = require('@faker-js/faker')

describe('GET /comments', () => {
    it('should return a 200 response', (done) => {
        request(app).get('/comments')
        .expect(200, done);
    });
    it('should return a comment with a name', (done) => {
        request(app).get('/comments')
        .then(result => {
            console.log('result', result._body.comments[0]);
            expect(result._body.comments[0]).to.have.property('title');
            done();
        });
    });
    it('should have more than 1 comments', (done) => {
        request(app).get('/comments')
        .then(result => {
            expect(result._body.comments.length).to.be.above(1);
            done();
        });
    });
});

describe('POST to /comments/new', () => {    
    it('should create a new comment and have a valid title', (done) => {
        let title = faker.lorem.word();
        request(app).post('/comments/new')
        .type('form')
        .send({
            title: title,
            body: faker.lorem.sentence(),

        })
        .then(response => {
            console.log('new airline created', response._body);
            expect(response._body.comment.title).to.be.equal(title);
            done();
        })
        .catch(error=> {
            console.log('error', error);
            throw error;
        })
    });

    it('returns a 200 response', (done) => {
        let title = faker.lorem.word();
        request(app).post('/comments/new')
        .type('form')
        .send({
            title: title,
            body: faker.lorem.sentence(),
        })
        .expect(200, done);
    })
});

describe('PUT to /comments/:id', () => {
    it('should update an comment and have a valid title', (done) => {
        let title = faker.lorem.word();
        request(app).post('/comments/new')
        .type('form')
        .send({
            title: title,
            body: faker.lorem.sentence()
        })
        .then(response => {
            console.log('new comment created', response._body);
            const commentId = response._body.comment._id;
            let randomTitle = faker.lorem.word();
            request(app).put(`/comments/${commentId}`)
            .type('form')
            .send({ title: randomTitle })
            .then(updatedcomment => {
                expect(updatedcomment._body.comment.title).to.be.equal(randomTitle);
                done();
            })
            .catch(error=> {
                console.log('error', error);
                throw error;
            });
        })
        .catch(error=> {
            console.log('error', error);
            throw error;
        });
    });

    it('returns a 200 response', (done) => {
        let title = faker.lorem.word();
        request(app).post('/comments/new')
        .type('form')
        .send({
            title: title,
            body: faker.lorem.sentence()
        })
        .then(response => {
            console.log('new comment created', response._body);
            const commentId = response._body.comment._id;
            let randomTitle = faker.lorem.word();
            request(app).put(`/comments/${commentId}`)
            .type('form')
            .send({ title: randomTitle })
            .expect(200, done);
        })
        .catch(error=> {
            console.log('error', error);
            throw error;
        });
    });
});

describe('DELETE /comments/:id', ()=> {
    it('should delete an comment and return a 200 response', (done) => {
        let title = faker.lorem.word();
        request(app).post('/comments/new')
        .type('form')
        .send({
            title: title,
            body: faker.lorem.sentence()
        })
        .then(response => {
            console.log('new comment created', response._body)
            const commentId = response._body.comment._id;
            request(app).delete(`/comments/${commentId}`)
            .expect(200, done);
        })
        .catch(error=> {
            console.log('error', error);
            throw error;
        });
    });
});