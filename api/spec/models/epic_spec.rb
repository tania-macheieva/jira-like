# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Epic, type: :model do
  subject(:epic) { FactoryBot.build(:epic) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:workspace) }
    it { is_expected.to have_many(:issues).dependent(:nullify) }
  end
end
