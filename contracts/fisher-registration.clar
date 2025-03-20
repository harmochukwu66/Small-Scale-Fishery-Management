;; Fisher Registration Contract
;; Records details of local fishing operations

(define-data-var next-fisher-id uint u1)

;; Map of fisher IDs to fisher details
(define-map fishers
  uint
  {
    name: (string-ascii 100),
    location: (string-ascii 100),
    vessel-name: (string-ascii 100),
    vessel-size: uint,
    license-number: (string-ascii 50),
    registered-at: uint,
    active: bool
  }
)

;; Map of principal to fisher ID
(define-map principal-to-fisher principal uint)

;; Register a new fisher
(define-public (register-fisher
    (name (string-ascii 100))
    (location (string-ascii 100))
    (vessel-name (string-ascii 100))
    (vessel-size uint)
    (license-number (string-ascii 50)))
  (let ((fisher-id (var-get next-fisher-id)))
    (asserts! (is-none (map-get? principal-to-fisher tx-sender)) (err u1)) ;; Already registered
    (map-set fishers fisher-id {
      name: name,
      location: location,
      vessel-name: vessel-name,
      vessel-size: vessel-size,
      license-number: license-number,
      registered-at: block-height,
      active: true
    })
    (map-set principal-to-fisher tx-sender fisher-id)
    (var-set next-fisher-id (+ fisher-id u1))
    (ok fisher-id)
  )
)

;; Update fisher details
(define-public (update-fisher-details
    (name (string-ascii 100))
    (location (string-ascii 100))
    (vessel-name (string-ascii 100))
    (vessel-size uint)
    (license-number (string-ascii 50)))
  (let ((fisher-id (unwrap! (map-get? principal-to-fisher tx-sender) (err u2)))) ;; Not registered
    (let ((fisher (unwrap! (map-get? fishers fisher-id) (err u3)))) ;; Fisher not found
      (map-set fishers fisher-id {
        name: name,
        location: location,
        vessel-name: vessel-name,
        vessel-size: vessel-size,
        license-number: license-number,
        registered-at: (get registered-at fisher),
        active: (get active fisher)
      })
      (ok true)
    )
  )
)

;; Deactivate fisher
(define-public (deactivate-fisher)
  (let ((fisher-id (unwrap! (map-get? principal-to-fisher tx-sender) (err u2)))) ;; Not registered
    (let ((fisher (unwrap! (map-get? fishers fisher-id) (err u3)))) ;; Fisher not found
      (map-set fishers fisher-id {
        name: (get name fisher),
        location: (get location fisher),
        vessel-name: (get vessel-name fisher),
        vessel-size: (get vessel-size fisher),
        license-number: (get license-number fisher),
        registered-at: (get registered-at fisher),
        active: false
      })
      (ok true)
    )
  )
)

;; Reactivate fisher
(define-public (reactivate-fisher)
  (let ((fisher-id (unwrap! (map-get? principal-to-fisher tx-sender) (err u2)))) ;; Not registered
    (let ((fisher (unwrap! (map-get? fishers fisher-id) (err u3)))) ;; Fisher not found
      (map-set fishers fisher-id {
        name: (get name fisher),
        location: (get location fisher),
        vessel-name: (get vessel-name fisher),
        vessel-size: (get vessel-size fisher),
        license-number: (get license-number fisher),
        registered-at: (get registered-at fisher),
        active: true
      })
      (ok true)
    )
  )
)

;; Get fisher details by ID
(define-read-only (get-fisher-by-id (fisher-id uint))
  (map-get? fishers fisher-id)
)

;; Get fisher ID by principal
(define-read-only (get-fisher-id-by-principal (fisher-principal principal))
  (map-get? principal-to-fisher fisher-principal)
)

;; Get total number of registered fishers
(define-read-only (get-total-fishers)
  (- (var-get next-fisher-id) u1)
)

