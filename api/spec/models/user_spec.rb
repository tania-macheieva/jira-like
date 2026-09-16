# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  subject(:user) { FactoryBot.build(:user) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email) }
    it { is_expected.to validate_presence_of(:password_digest) }
  end

  describe 'associations' do
    it { is_expected.to have_many(:workspace_memberships).dependent(:destroy) }
    it { is_expected.to have_many(:workspaces).through(:workspace_memberships) }

    it do
      is_expected.to have_many(:created_issues)
        .class_name('Issue')
        .with_foreign_key(:creator_id)
        .dependent(:destroy)
    end

    it do
      is_expected.to have_many(:assigned_issues)
        .class_name('Issue')
        .with_foreign_key(:assignee_id)
        .dependent(:nullify)
    end

    it { is_expected.to have_many(:comments).dependent(:destroy) }
  end
end
