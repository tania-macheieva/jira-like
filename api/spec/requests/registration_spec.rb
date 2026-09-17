# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Registrations', type: :request do
  describe 'POST /api/v1/auth/register' do
    it 'creates a user and returns a success response' do
      post '/api/v1/auth/register',
           params: {
             user: {
               name: 'Alice',
               email: 'alice@example.com',
               password: 'Password123!',
               password_confirmation: 'Password123!'
             }
           },
           as: :json

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)).to include('message' => 'User registered successfully')
      expect(User.last.email).to eq('alice@example.com')
    end

    it 'returns validation errors for invalid registrations' do
      post '/api/v1/auth/register',
           params: {
             user: {
               name: '',
               email: 'alice@example.com',
               password: 'short',
               password_confirmation: 'short'
             }
           },
           as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      errors = JSON.parse(response.body)['errors'].join(' ')
      expect(errors).to match(/name.*can't be blank|password.*is too short/i)
    end
  end
end
