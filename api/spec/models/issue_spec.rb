# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Issue, type: :model do
  subject(:issue) { FactoryBot.build(:issue) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_presence_of(:status) }
    it { is_expected.to validate_presence_of(:issue_type) }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:workspace) }
    it { is_expected.to belong_to(:epic).optional }
    it { is_expected.to belong_to(:assignee).class_name('User').optional }
    it { is_expected.to belong_to(:creator).class_name('User') }
  end

  describe '#epic_belongs_to_workspace' do
    it 'rejects epics from a different workspace' do
      workspace = FactoryBot.create(:workspace)
      other_workspace = FactoryBot.create(:workspace)
      epic = FactoryBot.create(:epic, workspace: other_workspace)

      issue = FactoryBot.build(:issue, workspace: workspace, epic: epic)

      expect(issue).not_to be_valid
      expect(issue.errors[:epic]).to include('must belong to the same workspace as the issue')
    end
  end
end
