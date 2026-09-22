# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Logins', type: :request do
  describe 'POST /api/v1/auth/login' do
    let!(:user) { FactoryBot.create(:user, email: 'test@example.com', password: 'Password123!') }

    it 'logs in with valid credentials' do
      post '/api/v1/auth/login',
           params: { email: user.email, password: 'Password123!' },
           as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to include('message' => 'Login successful')
      expect(session[:user_id]).to eq(user.id)
    end

    it 'rejects invalid credentials' do
      post '/api/v1/auth/login',
           params: { email: user.email, password: 'WrongPassword' },
           as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)).to include('error' => 'Invalid email or password')
      expect(session[:user_id]).to be_nil
    end

    it 'rejects an unknown email' do
      post '/api/v1/auth/login',
           params: { email: 'unknown@example.com', password: 'Password123!' },
           as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(session[:user_id]).to be_nil
    end
  end

  describe 'GET /api/v1/auth/me' do
    it 'returns the authenticated user' do
      user = FactoryBot.create(:user)
      post '/api/v1/auth/login',
           params: { email: user.email, password: 'Password123!' },
           as: :json

      get '/api/v1/auth/me', as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to eq(
        'user' => { 'id' => user.id, 'name' => user.name, 'email' => user.email }
      )
    end

    it 'rejects unauthenticated requests' do
      get '/api/v1/auth/me', as: :json

      expect(response).to have_http_status(:unauthorized)
      expect(JSON.parse(response.body)).to include('error' => 'Authentication required')
    end
  end

  describe 'DELETE /api/v1/auth/logout' do
    it 'clears the authenticated session' do
      user = FactoryBot.create(:user)
      post '/api/v1/auth/login',
           params: { email: user.email, password: 'Password123!' },
           as: :json

      delete '/api/v1/auth/logout', as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to include('message' => 'Logout successful')
      expect(session[:user_id]).to be_nil
    end
  end
end
