const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Caminho CORRETO para o review.proto
const reviewsProtoDefinition = protoLoader.loadSync(
    path.join(__dirname, '../../proto/review.proto'),
    {
        keepCase: true,
        longs: String,
        enums: String,
        arrays: true,
    }
);

const reviewsPackageDefinition = grpc.loadPackageDefinition(reviewsProtoDefinition);

// Agora isso NÃO será mais undefined
const ReviewService = reviewsPackageDefinition.ReviewService;

// Array em memória
const reviewsData = [];

const server = new grpc.Server();

server.addService(ReviewService.service, {
    GetReviews: (call, callback) => {
        const productId = call.request.id;
        const productReviews = reviewsData.filter(
            (review) => review.productId == productId
        );
        callback(null, { reviews: productReviews });
    },

    AddReview: (call, callback) => {
        const review = call.request;
        review.date = new Date().toISOString();
        reviewsData.push(review);

        callback(null, {
            success: true,
            message: 'Avaliação adicionada com sucesso!',
        });
    },
});

// Iniciar servidor
server.bindAsync(
    '0.0.0.0:3003',
    grpc.ServerCredentials.createInsecure(),
    () => console.log('Reviews Service running at http://127.0.0.1:3003')
);
