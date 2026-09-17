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

  describe 'password authentication' do
    it 'authenticates with the correct password' do
      user = FactoryBot.create(:user, password: 'Password123!')
      expect(user.authenticate('Password123!')).to eq(user)
    end

    it 'does not authenticate with an incorrect password' do
      user = FactoryBot.create(:user, password: 'Password123!')
      expect(user.authenticate('WrongPassword')).to be_falsey
    end

    it 'does not authenticate with an empty password' do
      user = FactoryBot.create(:user, password: 'Password123!')
      expect(user.authenticate('')).to be_falsey
    end

    it 'does not store the password in plain text' do
      user = FactoryBot.create(:user, password: 'Password123!')

      expect(user.password_digest).not_to eq('Password123!')
    end

    it 'validates password confirmation' do
      user = FactoryBot.build(:user, password: 'correct_password', password_confirmation: 'wrong_password')

      expect(user).not_to be_valid
    end
  end
end
