# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Registrations', type: :request do
  describe 'POST /api/v1/auth/register' do
    it 'creates a user and returns a success response' do
      post '/api/v1/auth/register',
           params: {
             user: {
               name: 'Test User',
               email: 'test@example.com',
               password: 'Password123!',
               password_confirmation: 'Password123!'
             }
           },
           as: :json

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)).to include('message' => 'User registered successfully')
      expect(User.last.email).to eq('test@example.com')
    end

    it 'returns validation errors for invalid registrations' do
      post '/api/v1/auth/register',
           params: {
             user: {
               name: '',
               email: 'test@example.com',
               password: 'short',
               password_confirmation: 'short'
             }
           },
           as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)['errors'].join(' ')
      expect(errors).to match(/name.*can't be blank|password.*is too short/i)
    end

    it 'returns validation errors for password confirmation mismatch' do
      post '/api/v1/auth/register',
           params: {
             user: {
               name: 'Test User',
               email: 'test@exapmle.com',
               password: 'Password123!',
               password_confirmation: 'Password1234!'
             }
           },
           as: :json
      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)['errors'].join(' ')
      expect(errors).to match(/Password confirmation doesn't match Password/i)
    end

    it 'returns validation errors for duplicate email' do
      FactoryBot.create(:user, email: 'test@example.com')
      post '/api/v1/auth/register',
           params: {
             user: {
               name: 'Test User',
               email: 'test@example.com',
               password: 'Password123!',
               password_confirmation: 'Password123!'
             }
           },
           as: :json
      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)['errors'].join(' ')
      expect(errors).to match(/Email has already been taken/i)
    end
  end
end
