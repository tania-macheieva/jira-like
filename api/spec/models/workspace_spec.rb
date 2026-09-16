# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Workspace, type: :model do
  subject(:workspace) { FactoryBot.build(:workspace) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:key) }
    it { is_expected.to validate_uniqueness_of(:key) }
  end

  describe 'associations' do
    it { is_expected.to have_many(:workspace_memberships).dependent(:destroy) }
    it { is_expected.to have_many(:users).through(:workspace_memberships) }
    it { is_expected.to have_many(:epics).dependent(:destroy) }
    it { is_expected.to have_many(:issues).dependent(:destroy) }
  end
end
