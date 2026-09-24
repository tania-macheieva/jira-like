# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Issues', type: :request do
  let!(:user) { FactoryBot.create(:user) }
  let!(:workspace) { FactoryBot.create(:workspace) }
  let!(:epic) { FactoryBot.create(:epic, workspace: workspace) }

  before do
    post '/api/v1/auth/login',
         params: { email: user.email, password: 'Password123!' },
         as: :json
  end

  describe 'workspace member access' do
    before do
      FactoryBot.create(:workspace_membership, user: user, workspace: workspace, role: :member)
    end

    it 'creates an issue with the current user as creator' do
      post "/api/v1/workspaces/#{workspace.id}/issues",
           params: {
             issue: {
               title: 'Implement issue API',
               description: 'Issue CRUD',
               status: 'in_progress',
               issue_type: 'feature',
               epic_id: epic.id
             }
           },
           as: :json

      issue = Issue.last
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)['issue']).to include(
        'id' => issue.id,
        'workspace_id' => workspace.id,
        'epic_id' => epic.id,
        'creator_id' => user.id,
        'status' => 'in_progress',
        'issue_type' => 'feature'
      )
    end

    it 'lists workspace issues' do
      issue = FactoryBot.create(:issue, workspace: workspace, epic: epic, status: :qa)

      get "/api/v1/workspaces/#{workspace.id}/issues", as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['issues'].map { |item| item['id'] }).to include(issue.id)
    end

    it 'filters issues by status, issue type, assignee, and epic' do
      assignee = FactoryBot.create(:user)
      matching_issue = FactoryBot.create(
        :issue,
        workspace: workspace,
        epic: epic,
        assignee: assignee,
        status: :in_progress,
        issue_type: :bug
      )
      FactoryBot.create(:issue, workspace: workspace, epic: epic, status: :done, issue_type: :task)

      get "/api/v1/workspaces/#{workspace.id}/issues",
          params: {
            status: 'in_progress',
            issue_type: 'bug',
            assignee_id: assignee.id,
            epic_id: epic.id
          },
          as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['issues'].map { |item| item['id'] }).to eq([matching_issue.id])
    end

    it 'shows, updates, and deletes an issue' do
      issue = FactoryBot.create(:issue, workspace: workspace, epic: epic, status: :qa)

      get "/api/v1/issues/#{issue.id}", as: :json
      expect(response).to have_http_status(:ok)

      patch "/api/v1/issues/#{issue.id}",
            params: { issue: { title: 'Updated issue', status: 'done' } },
            as: :json
      expect(response).to have_http_status(:ok)
      expect(issue.reload).to have_attributes(title: 'Updated issue', status: 'done')

      delete "/api/v1/issues/#{issue.id}", as: :json
      expect(response).to have_http_status(:no_content)
    end

    it 'rejects an invalid status transition' do
      issue = FactoryBot.create(:issue, workspace: workspace, epic: epic, status: :review)

      patch "/api/v1/issues/#{issue.id}",
            params: { issue: { status: 'done' } },
            as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)['errors'])
        .to include('Transition from review to done is not allowed')
      expect(issue.reload.status).to eq('review')
    end

    it 'moves an issue through the workflow' do
      issue = FactoryBot.create(:issue, workspace: workspace, epic: epic, status: :qa)

      patch "/api/v1/issues/#{issue.id}",
            params: { issue: { status: 'in_progress' } },
            as: :json

      expect(response).to have_http_status(:ok)
      expect(issue.reload.status).to eq('in_progress')
    end
  end

  it 'forbids a non-member from accessing another workspace issue' do
    issue = FactoryBot.create(:issue, workspace: workspace, epic: epic)

    get "/api/v1/issues/#{issue.id}", as: :json

    expect(response).to have_http_status(:forbidden)
  end

  it 'forbids a non-member from listing or creating issues' do
    get "/api/v1/workspaces/#{workspace.id}/issues", as: :json
    expect(response).to have_http_status(:forbidden)

    post "/api/v1/workspaces/#{workspace.id}/issues",
         params: { issue: { title: 'Forbidden issue' } },
         as: :json
    expect(response).to have_http_status(:forbidden)
  end

  it 'returns validation errors for an invalid issue' do
    FactoryBot.create(:workspace_membership, user: user, workspace: workspace, role: :member)

    post "/api/v1/workspaces/#{workspace.id}/issues",
         params: { issue: { title: '' } },
         as: :json

    expect(response).to have_http_status(:unprocessable_entity)
    expect(JSON.parse(response.body)['errors']).to include("Title can't be blank")
  end

  it 'rejects an epic from another workspace' do
    FactoryBot.create(:workspace_membership, user: user, workspace: workspace, role: :member)
    other_workspace = FactoryBot.create(:workspace)
    other_epic = FactoryBot.create(:epic, workspace: other_workspace)

    post "/api/v1/workspaces/#{workspace.id}/issues",
         params: { issue: { title: 'Invalid epic', epic_id: other_epic.id } },
         as: :json

    expect(response).to have_http_status(:unprocessable_entity)
    expect(JSON.parse(response.body)['errors']).to include('Epic must belong to the same workspace as the issue')
  end
end
