# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommentPolicy, type: :policy do
  subject(:policy) { described_class.new(user, comment) }

  let(:workspace) { FactoryBot.create(:workspace) }
  let(:issue) { FactoryBot.create(:issue, workspace: workspace) }
  let(:comment_author) { FactoryBot.create(:user) }
  let(:comment) { FactoryBot.create(:comment, issue: issue, user: comment_author) }
  let(:user) { FactoryBot.create(:user) }

  before do
    FactoryBot.create(:workspace_membership, workspace: workspace, user: user, role: role)
  end

  describe '#update?' do
    subject { policy.update? }

    context 'when the user is the comment author' do
      let(:user) { comment_author }
      let(:role) { :member }

      it { is_expected.to be(true) }
    end

    context 'when the user is an admin' do
      let(:role) { :admin }

      it { is_expected.to be(true) }
    end

    context 'when the user is another member' do
      let(:role) { :member }

      it { is_expected.to be(false) }
    end
  end
end
