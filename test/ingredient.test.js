const app = require('../app');
const request = require('supertest');
const expect = require('chai').expect;
const { describe, it} = require('mocha');

const { faker } = require('@faker-js/faker')

describe('GET /ingredients', () => {
    it('should return a 200 response', (done) => {
        request(app).get('/ingredients')
            .expect(200, done);
    });
    it('should return a ingredient with a name', (done) => {
        request(app).get('/ingredients')
            .then(result => {
                console.log('result', result._body.ingredients[0]);
                expect(result._body.ingredients[0]).to.have.property('name');
                done();
            });
    });
    it('should have more than 1 ingredients', (done) => {
        request(app).get('/ingredients')
            .then(result => {
                expect(result._body.ingredients.length).to.be.above(1);
                done();
            });
    });
});

describe('POST to /ingredients/new', () => {    
    it('should create a new ingredient and have a valid name', (done) => {
        let name = faker.person.firstName();
        request(app).post('/ingredients/new')
            .type('form')
            .send({
                name: name,
                description: '3 sip',
                type: 'fruit',
                alcoholic: Boolean('true'),
    
            })
            .then(response => {
                console.log('new airline created', response._body)
                expect(response._body.ingredient.name).to.be.equal(name)
                done();
            })
            .catch(error=> {
                console.log('error', error);
                throw error;
            })
    });

    it('returns a 200 response', (done) => {
        let name = faker.person.firstName();
        request(app).post('/ingredients/new')
        .type('form')
        .send({
            name: name,
            description: '3 sip',
            type: 'fruit',
            alcoholic: Boolean('true'),
        })
        .expect(200, done);
    })
});

describe('PUT to /ingredients/:id', () => {
    it('should update an ingredient and have a valid name', (done) => {
        let name = faker.person.firstName()
        request(app).post('/ingredients/new')
            .type('form')
            .send({
                name: name,
                description: '3 sip',
                type: 'fruit',
                alcoholic: Boolean('true')
            })
            .then(response => {
                console.log('new ingredient created', response._body)
                const ingredientId = response._body.ingredient._id;
                let randomName = faker.person.firstName()
                request(app).put(`/ingredients/${ingredientId}`)
                .type('form')
                .send({ name: randomName })
                .then(updatedingredient => {
                    expect(updatedingredient._body.ingredient.name).to.be.equal(randomName)
                    done();
                })
            })
            .catch(error=> {
                console.log('error', error);
                throw error;
            })
    });

    it('returns a 200 response', (done) => {
        let name = faker.person.firstName()
        request(app).post('/ingredients/new')
            .type('form')
            .send({
                name: name,
                description: '3 sip',
                type: 'fruit',
                alcoholic: Boolean('true')
            })
            .then(response => {
                console.log('new airline created', response._body)
                const ingredientId = response._body.ingredient._id;
                let randomName = faker.person.firstName()
                request(app).put(`/ingredients/${ingredientId}`)
                .type('form')
                .send({ ingredient: randomName })
                .expect(200, done);
            })
            .catch(error=> {
                console.log('error', error);
                throw error;
            })
    })
})

describe('DELETE /ingredients/:id', ()=> {
    it('should delete an ingredient and return a 200 response', (done) => {
    let name = faker.person.firstName()
    request(app).post('/ingredients/new')
            .type('form')
            .send({
                name: name,
                description: '3 sip',
                type: 'fruit',
                alcoholic: Boolean('true')
            })
            .then(response => {
                console.log('new ingredient created', response._body)
                const ingredientId = response._body.ingredient._id;
                request(app).delete(`/ingredients/${ingredientId}`)
                .expect(200, done);
            })
            .catch(error=> {
                console.log('error', error);
                throw error;
            })
})
})