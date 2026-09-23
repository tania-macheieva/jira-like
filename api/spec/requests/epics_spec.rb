# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Epics', type: :request do
  let!(:user) { FactoryBot.create(:user) }
  let!(:workspace) { FactoryBot.create(:workspace) }

  before do
    post '/api/v1/auth/login',
         params: { email: user.email, password: 'Password123!' },
         as: :json
  end

  describe 'workspace member access' do
    before do
      FactoryBot.create(:workspace_membership, user: user, workspace: workspace, role: :member)
    end

    it 'creates an epic in the workspace' do
      post "/api/v1/workspaces/#{workspace.id}/epics",
           params: { epic: { name: 'Authentication', description: 'Authentication work' } },
           as: :json

      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['epic']).to include(
        'workspace_id' => workspace.id,
        'name' => 'Authentication',
        'description' => 'Authentication work'
      )
    end

    it 'lists workspace epics' do
      epic = FactoryBot.create(:epic, workspace: workspace)

      get "/api/v1/workspaces/#{workspace.id}/epics", as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['epics'].map { |item| item['id'] }).to include(epic.id)
    end

    it 'shows, updates, and deletes an epic' do
      epic = FactoryBot.create(:epic, workspace: workspace)

      get "/api/v1/epics/#{epic.id}", as: :json
      expect(response).to have_http_status(:ok)

      patch "/api/v1/epics/#{epic.id}",
            params: { epic: { name: 'Updated Epic' } },
            as: :json
      expect(response).to have_http_status(:ok)
      expect(epic.reload.name).to eq('Updated Epic')

      delete "/api/v1/epics/#{epic.id}", as: :json
      expect(response).to have_http_status(:no_content)
    end
  end

  it 'forbids a non-member from accessing another workspace epic' do
    epic = FactoryBot.create(:epic, workspace: workspace)

    get "/api/v1/epics/#{epic.id}", as: :json

    expect(response).to have_http_status(:forbidden)
  end

  it 'forbids a non-member from listing or creating epics' do
    get "/api/v1/workspaces/#{workspace.id}/epics", as: :json
    expect(response).to have_http_status(:forbidden)

    post "/api/v1/workspaces/#{workspace.id}/epics",
         params: { epic: { name: 'Forbidden Epic' } },
         as: :json
    expect(response).to have_http_status(:forbidden)
  end

  it 'returns validation errors for an invalid epic' do
    FactoryBot.create(:workspace_membership, user: user, workspace: workspace, role: :member)

    post "/api/v1/workspaces/#{workspace.id}/epics",
         params: { epic: { name: '' } },
         as: :json

    expect(response).to have_http_status(:unprocessable_entity)
    expect(JSON.parse(response.body)['errors']).to include("Name can't be blank")
  end
end
