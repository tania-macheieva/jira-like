# frozen_string_literal: true

class Epic < ApplicationRecord
  belongs_to :workspace

  has_many :issues, dependent: :nullify
end
