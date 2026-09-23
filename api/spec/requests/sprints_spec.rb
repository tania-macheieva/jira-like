# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Sprints', type: :request do
  let!(:user) { FactoryBot.create(:user) }
  let!(:workspace) { FactoryBot.create(:workspace) }

  before do
    FactoryBot.create(:workspace_membership, user: user, workspace: workspace, role: :member)
    post '/api/v1/auth/login', params: { email: user.email, password: 'Password123!' }, as: :json
  end

  it 'creates and lists workspace sprints' do
    post "/api/v1/workspaces/#{workspace.id}/sprints",
         params: { sprint: { name: 'Sprint 1', status: 'planned' } }, as: :json
    expect(response).to have_http_status(:created)
    sprint = Sprint.last

    get "/api/v1/workspaces/#{workspace.id}/sprints", as: :json
    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)['sprints'].map { |item| item['id'] }).to include(sprint.id)
  end

  it 'updates and deletes a sprint' do
    sprint = FactoryBot.create(:sprint, workspace: workspace)
    patch "/api/v1/sprints/#{sprint.id}", params: { sprint: { status: 'active' } }, as: :json
    expect(response).to have_http_status(:ok)
    expect(sprint.reload).to be_active

    delete "/api/v1/sprints/#{sprint.id}", as: :json
    expect(response).to have_http_status(:no_content)
  end

  it 'forbids non-members from accessing a sprint' do
    other_user = FactoryBot.create(:user)
    sprint = FactoryBot.create(:sprint, workspace: workspace)
    delete '/api/v1/auth/logout', as: :json
    post '/api/v1/auth/login', params: { email: other_user.email, password: 'Password123!' }, as: :json

    get "/api/v1/sprints/#{sprint.id}", as: :json
    expect(response).to have_http_status(:forbidden)
  end
end
