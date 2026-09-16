# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorkspaceMembership, type: :model do
  subject(:workspace_membership) { FactoryBot.build(:workspace_membership) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:role) }
    it do
      is_expected.to validate_uniqueness_of(:user_id)
        .scoped_to(:workspace_id)
        .with_message('is already a member of this workspace')
    end
  end

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:workspace) }
  end
end
