# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Workspaces', type: :request do
  let!(:user) { FactoryBot.create(:user) }

  before do
    post '/api/v1/auth/login',
         params: { email: user.email, password: 'Password123!' },
         as: :json
  end

  describe 'POST /api/v1/workspaces' do
    it 'creates a workspace and makes the user its owner' do
      post '/api/v1/workspaces',
           params: { workspace: { name: 'Product', key: 'PROD' } },
           as: :json

      workspace = Workspace.last
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['workspace']).to include(
        'id' => workspace.id, 'name' => 'Product', 'key' => 'PROD'
      )
      expect(workspace.workspace_memberships.find_by(user: user)).to be_owner
    end
  end

  describe 'workspace access' do
    let!(:workspace) { FactoryBot.create(:workspace) }
    let!(:membership) { FactoryBot.create(:workspace_membership, workspace: workspace, user: user, role: :member) }

    it 'lists the current user workspaces' do
      get '/api/v1/workspaces', as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['workspaces'].map { |item| item['id'] }).to include(workspace.id)
    end

    it 'shows a workspace to its members' do
      get "/api/v1/workspaces/#{workspace.id}", as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['workspace']).to include('id' => workspace.id)
    end

    it 'forbids members from updating a workspace' do
      patch "/api/v1/workspaces/#{workspace.id}",
            params: { workspace: { name: 'Updated' } },
            as: :json

      expect(response).to have_http_status(:forbidden)
    end

    it 'forbids members from deleting a workspace' do
      delete "/api/v1/workspaces/#{workspace.id}", as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  it 'allows an admin to update but not delete a workspace' do
    workspace = FactoryBot.create(:workspace)
    FactoryBot.create(:workspace_membership, workspace: workspace, user: user, role: :admin)

    patch "/api/v1/workspaces/#{workspace.id}",
          params: { workspace: { name: 'Updated' } },
          as: :json
    expect(response).to have_http_status(:ok)

    delete "/api/v1/workspaces/#{workspace.id}", as: :json
    expect(response).to have_http_status(:forbidden)
  end

  it 'allows the owner to update and delete a workspace' do
    workspace = FactoryBot.create(:workspace)
    FactoryBot.create(:workspace_membership, workspace: workspace, user: user, role: :owner)

    patch "/api/v1/workspaces/#{workspace.id}",
          params: { workspace: { name: 'Updated' } },
          as: :json
    expect(response).to have_http_status(:ok)

    delete "/api/v1/workspaces/#{workspace.id}", as: :json
    expect(response).to have_http_status(:no_content)
  end
end
