# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Comments', type: :request do
  let!(:user) { FactoryBot.create(:user) }
  let!(:workspace) { FactoryBot.create(:workspace) }
  let!(:issue) { FactoryBot.create(:issue, workspace: workspace) }

  before do
    post '/api/v1/auth/login',
         params: { email: user.email, password: 'Password123!' },
         as: :json
  end

  it 'allows a member to create and list comments' do
    FactoryBot.create(:workspace_membership, user: user, workspace: workspace, role: :member)

    post "/api/v1/issues/#{issue.id}/comments",
         params: { comment: { body: 'First comment' } },
         as: :json

    expect(response).to have_http_status(:created)
    expect(JSON.parse(response.body)['comment']).to include(
      'issue_id' => issue.id,
      'user_id' => user.id,
      'body' => 'First comment'
    )

    get "/api/v1/issues/#{issue.id}/comments", as: :json

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)['comments'].map { |comment| comment['body'] }).to include('First comment')
  end

  it 'allows the author to update and delete their comment' do
    FactoryBot.create(:workspace_membership, user: user, workspace: workspace, role: :member)
    comment = FactoryBot.create(:comment, issue: issue, user: user)

    patch "/api/v1/comments/#{comment.id}",
          params: { comment: { body: 'Updated comment' } },
          as: :json

    expect(response).to have_http_status(:ok)
    expect(comment.reload.body).to eq('Updated comment')

    delete "/api/v1/comments/#{comment.id}", as: :json

    expect(response).to have_http_status(:no_content)
  end

  it 'allows an admin to moderate another member comment' do
    FactoryBot.create(:workspace_membership, user: user, workspace: workspace, role: :admin)
    comment = FactoryBot.create(:comment, issue: issue)

    patch "/api/v1/comments/#{comment.id}",
          params: { comment: { body: 'Moderated comment' } },
          as: :json

    expect(response).to have_http_status(:ok)
    expect(comment.reload.body).to eq('Moderated comment')
  end

  it 'forbids another member from editing a comment' do
    FactoryBot.create(:workspace_membership, user: user, workspace: workspace, role: :member)
    comment = FactoryBot.create(:comment, issue: issue)

    patch "/api/v1/comments/#{comment.id}",
          params: { comment: { body: 'Not allowed' } },
          as: :json

    expect(response).to have_http_status(:forbidden)
    expect(comment.reload.body).not_to eq('Not allowed')
  end

  it 'rejects non-members from viewing or creating comments' do
    get "/api/v1/issues/#{issue.id}/comments", as: :json
    expect(response).to have_http_status(:forbidden)

    post "/api/v1/issues/#{issue.id}/comments",
         params: { comment: { body: 'Not allowed' } },
         as: :json
    expect(response).to have_http_status(:forbidden)
  end
end
