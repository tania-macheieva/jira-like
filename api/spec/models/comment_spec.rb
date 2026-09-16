# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Comment, type: :model do
  subject(:comment) { FactoryBot.build(:comment) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:body) }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:issue) }
    it { is_expected.to belong_to(:user) }
  end
end
